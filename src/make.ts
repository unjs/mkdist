import { resolve, extname, join, basename, dirname } from "pathe";
import fsp from "node:fs/promises";
import type { TSConfig } from "pkg-types";
import defu from "defu";
import { copyFileWithStream } from "./utils/fs";
import {
  InputFile,
  LoaderOptions,
  createLoader,
  OutputFile,
  Loader,
} from "./loader";
import { getDeclarations, normalizeCompilerOptions } from "./utils/dts";
import { getVueDeclarations } from "./utils/vue-dts";
import { LoaderName } from "./loaders";
import { glob } from "tinyglobby";

export interface MkdistOptions extends LoaderOptions {
  rootDir?: string;
  srcDir?: string;
  pattern?: string | string[];
  distDir?: string;
  cleanDist?: boolean;
  loaders?: (LoaderName | Loader)[];
  addRelativeDeclarationExtensions?: boolean;
  typescript?: {
    compilerOptions?: TSConfig["compilerOptions"];
  };
}

export async function mkdist(
  options: MkdistOptions /* istanbul ignore next */ = {},
) {
  // Resolve srcDir and distDir relative to rootDir
  options.rootDir = resolve(process.cwd(), options.rootDir || ".");
  options.srcDir = resolve(options.rootDir, options.srcDir || "src");
  options.distDir = resolve(options.rootDir, options.distDir || "dist");

  // Setup dist
  if (options.cleanDist !== false) {
    await fsp.unlink(options.distDir).catch(() => {});
    await fsp.rm(options.distDir, { recursive: true, force: true });
    await fsp.mkdir(options.distDir, { recursive: true });
  }

  // Scan input files
  const filePaths = await glob(options.pattern || "**", {
    absolute: false,
    cwd: options.srcDir,
  });

  const files: InputFile[] = filePaths.map((path) => {
    const sourcePath = resolve(options.srcDir, path);
    return {
      path,
      srcPath: sourcePath,
      extension: extname(path),
      getContents: () => fsp.readFile(sourcePath, { encoding: "utf8" }),
    };
  });

  // Read and normalise TypeScript compiler options for emitting declarations
  options.typescript ||= {};
  if (options.typescript.compilerOptions) {
    options.typescript.compilerOptions = await normalizeCompilerOptions(
      options.typescript.compilerOptions,
    );
  }
  options.typescript.compilerOptions = defu(
    { noEmit: false },
    options.typescript.compilerOptions,
    {
      allowJs: true,
      declaration: true,
      incremental: true,
      skipLibCheck: true,
      strictNullChecks: true,
      emitDeclarationOnly: true,
      allowNonTsExtensions: true,
    },
  );

  // Create loader
  const { loadFile } = createLoader(options);

  // Use loaders to get output files
  const outputs: OutputFile[] = [];
  for (const file of files) {
    outputs.push(...((await loadFile(file)) || []));
  }

  // Normalize output extensions
  for (const output of outputs.filter((o) => o.extension)) {
    const renamed =
      basename(output.path, output.srcExtension ?? extname(output.path)) +
      output.extension;
    output.path = join(dirname(output.path), renamed);
    // Avoid overriding files with original extension
    if (outputs.some((o) => o !== output && o.path === output.path)) {
      output.skip = true;
    }
  }

  // Generate declarations
  const dtsOutputs = outputs.filter((o) => o.declaration && !o.skip);
  if (dtsOutputs.length > 0) {
    const vfs = new Map(dtsOutputs.map((o) => [o.srcPath, o.contents || ""]));
    const declarations = Object.create(null);
    for (const loader of [getVueDeclarations, getDeclarations]) {
      Object.assign(declarations, await loader(vfs, options));
    }
    for (const output of dtsOutputs) {
      output.contents = declarations[output.srcPath] || "";
    }
  }

  // Resolve relative imports
  const outPaths = new Set(outputs.map((o) => o.path));
  const resolveId = (from: string, id = "", resolveExtensions: string[]) => {
    if (!id.startsWith(".")) {
      return id;
    }
    for (const extension of resolveExtensions) {
      if (outPaths.has(join(dirname(from), id + extension))) {
        return id + extension;
      }
    }
    return id;
  };
  const esmResolveExtensions = [
    "",
    "/index.mjs",
    "/index.js",
    ".mjs",
    ".ts",
    ".js",
  ];
  for (const output of outputs.filter(
    (o) => o.extension === ".mjs" || o.extension === ".js",
  )) {
    // Resolve import statements
    output.contents = output.contents
      .replace(
        /(import|export)(\s+(?:.+|{[\s\w,]+})\s+from\s+["'])(.*)(["'])/g,
        (_, type, head, id, tail) =>
          type + head + resolveId(output.path, id, esmResolveExtensions) + tail,
      )
      // Resolve dynamic import
      .replace(
        /import\((["'])(.*)(["'])\)/g,
        (_, head, id, tail) =>
          "import(" +
          head +
          resolveId(output.path, id, esmResolveExtensions) +
          tail +
          ")",
      );
  }
  const cjsResolveExtensions = ["", "/index.cjs", ".cjs"];
  for (const output of outputs.filter((o) => o.extension === ".cjs")) {
    // Resolve require statements
    output.contents = output.contents.replace(
      /require\((["'])(.*)(["'])\)/g,
      (_, head, id, tail) =>
        "require(" +
        head +
        resolveId(output.path, id, cjsResolveExtensions) +
        tail +
        ")",
    );
  }

  // Write outputs
  const writtenFiles: string[] = [];
  await Promise.all(
    outputs
      .filter((o) => !o.skip)
      .map(async (output) => {
        const outFile = join(options.distDir, output.path);
        await fsp.mkdir(dirname(outFile), { recursive: true });
        await (output.raw
          ? copyFileWithStream(output.srcPath, outFile)
          : fsp.writeFile(outFile, output.contents, "utf8"));
        writtenFiles.push(outFile);
      }),
  );

  return {
    writtenFiles,
  };
}
