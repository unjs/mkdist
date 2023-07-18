import { resolve, extname, join, basename, dirname } from "pathe";
import fse from "fs-extra";
import { copyFileWithStream } from "./utils/fs";
import {
  InputFile,
  LoaderOptions,
  createLoader,
  OutputFile,
  Loader,
} from "./loader";
import { getDeclarations } from "./utils/dts";
import { LoaderName } from "./loaders";

export interface MkdistOptions extends LoaderOptions {
  rootDir?: string;
  srcDir?: string;
  pattern?: string | string[];
  distDir?: string;
  cleanDist?: boolean;
  loaders?: (LoaderName | Loader)[];
  addRelativeDeclarationExtensions?: boolean;
}

export async function mkdist(
  options: MkdistOptions /* istanbul ignore next */ = {}
) {
  // Resolve srcDir and distDir relative to rootDir
  options.rootDir = resolve(process.cwd(), options.rootDir || ".");
  options.srcDir = resolve(options.rootDir, options.srcDir || "src");
  options.distDir = resolve(options.rootDir, options.distDir || "dist");

  // Setup dist
  if (options.cleanDist !== false) {
    await fse.unlink(options.distDir).catch(() => {});
    await fse.emptyDir(options.distDir);
    await fse.mkdirp(options.distDir);
  }

  // Scan input files
  const { globby } = await import("globby");
  const filePaths = await globby(options.pattern || "**", {
    absolute: false,
    cwd: options.srcDir,
  });

  const files: InputFile[] = filePaths.map((path) => {
    const sourcePath = resolve(options.srcDir, path);
    return {
      path,
      srcPath: sourcePath,
      extension: extname(path),
      getContents: () => fse.readFile(sourcePath, { encoding: "utf8" }),
    };
  });

  // Create loader
  const { loadFile } = createLoader({
    format: options.format,
    ext: options.ext,
    declaration: options.declaration,
    esbuild: options.esbuild,
    loaders: options.loaders,
  });

  // Use loaders to get output files
  const outputs: OutputFile[] = [];
  for (const file of files) {
    outputs.push(...((await loadFile(file)) || []));
  }

  // Normalize output extensions
  for (const output of outputs.filter((o) => o.extension)) {
    const renamed =
      basename(output.path, extname(output.path)) + output.extension;
    output.path = join(dirname(output.path), renamed);
    // Avoid overriding files with original extension
    if (outputs.some((o) => o !== output && o.path === output.path)) {
      output.skip = true;
    }
  }

  // Generate declarations
  const dtsOutputs = outputs.filter((o) => o.declaration && !o.skip);
  if (dtsOutputs.length > 0) {
    const declarations = await getDeclarations(
      new Map(dtsOutputs.map((o) => [o.srcPath, o.contents || ""])),
      {
        addRelativeDeclarationExtensions:
          options.addRelativeDeclarationExtensions,
      }
    );
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
    (o) => o.extension === ".mjs" || o.extension === ".js"
  )) {
    // Resolve import statements
    output.contents = output.contents.replace(
      /(import|export)(\s+(?:.+|{[\s\w,]+})\s+from\s+["'])(.*)(["'])/g,
      (_, type, head, id, tail) =>
        type + head + resolveId(output.path, id, esmResolveExtensions) + tail
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
        ")"
    );
  }

  // Write outputs
  const writtenFiles: string[] = [];
  await Promise.all(
    outputs
      .filter((o) => !o.skip)
      .map(async (output) => {
        const outFile = join(options.distDir, output.path);
        await fse.mkdirp(dirname(outFile));
        await (output.raw
          ? copyFileWithStream(output.srcPath, outFile)
          : fse.writeFile(outFile, output.contents, "utf8"));
        writtenFiles.push(outFile);
      })
  );

  return {
    writtenFiles,
  };
}
