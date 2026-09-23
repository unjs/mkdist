import {
  resolve,
  extname,
  join,
  basename,
  dirname,
  relative,
  isAbsolute,
} from "pathe";
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
import {
  DeclarationOutput,
  getDeclarations,
  normalizeCompilerOptions,
} from "./utils/dts";
import { getVueDeclarations } from "./utils/vue-dts";
import { LoaderName } from "./loaders";
import { glob, type GlobOptions } from "tinyglobby";
import { decode, encode } from "@jridgewell/sourcemap-codec";
import { findDynamicImports, findExports, findStaticImports } from "mlly";

interface SourceMapEdit {
  end: number;
  delta: number;
}

const IMPORT_TRIVIA_RE = /^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*(?:\n|$))*/;

function findImportIds(contents: string) {
  return findDynamicImports(contents).flatMap(({ code, expression, start }) => {
    const leadingTrivia = expression.match(IMPORT_TRIVIA_RE)?.[0] || "";
    const literal = expression
      .slice(leadingTrivia.length)
      .match(/^(["'])((?:\\.|[^\\])*?)\1/);
    if (!literal) {
      return [];
    }
    const rest = expression.slice(leadingTrivia.length + literal[0].length);
    const trailingTrivia = rest.match(IMPORT_TRIVIA_RE)?.[0] || "";
    const remainder = rest.slice(trailingTrivia.length);
    if (remainder && !remainder.startsWith(",")) {
      return [];
    }
    return [
      {
        id: literal[2],
        index: start + code.indexOf(expression) + leadingTrivia.length + 1,
      },
    ];
  });
}

function shiftSourceMap(
  sourceMap: string | undefined,
  contents: string,
  edits: SourceMapEdit[],
) {
  if (!sourceMap || edits.length === 0) {
    return sourceMap;
  }

  const parsed = JSON.parse(sourceMap) as { mappings: string };
  const mappings = decode(parsed.mappings);
  // Apply edits right-to-left so each threshold stays in original coordinates.
  for (const edit of edits.sort((a, b) => b.end - a.end)) {
    const before = contents.slice(0, edit.end);
    const line = before.split("\n").length - 1;
    const column = edit.end - before.lastIndexOf("\n") - 1;
    for (const segment of mappings[line] || []) {
      if (segment[0] >= column) {
        segment[0] += edit.delta;
      }
    }
  }
  parsed.mappings = encode(mappings);
  return JSON.stringify(parsed);
}

export interface MkdistOptions extends LoaderOptions {
  rootDir?: string;
  srcDir?: string;
  pattern?: string | string[];
  globOptions?: GlobOptions;
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
    ignore: ["**/node_modules", "**/coverage", "**/.git"],
    cwd: options.srcDir,
    dot: true,
    ...options.globOptions,
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
    { noEmit: false } satisfies TSConfig["compilerOptions"],
    options.typescript.compilerOptions,
    {
      allowJs: true,
      declaration: true,
      skipLibCheck: true,
      strictNullChecks: true,
      emitDeclarationOnly: true,
      allowImportingTsExtensions: true,
      allowNonTsExtensions: true,
    } satisfies TSConfig["compilerOptions"],
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
      basename(output.path, extname(output.path)) + output.extension;
    output.path = join(dirname(output.path), renamed);
    // Avoid overriding files with original extension
    if (
      outputs.some(
        (o) =>
          o !== output &&
          o.path === output.path &&
          (!o.extension || o.extension === output.extension),
      )
    ) {
      output.skip = true;
    }
  }

  // Generate declarations
  const dtsOutputs = outputs.filter((o) => o.declaration && !o.skip);
  if (dtsOutputs.length > 0) {
    const vfs = new Map(dtsOutputs.map((o) => [o.srcPath, o.contents || ""]));
    const declarations: DeclarationOutput = Object.create(null);
    for (const loader of [getVueDeclarations, getDeclarations]) {
      Object.assign(declarations, await loader(vfs, options));
    }
    for (const output of dtsOutputs) {
      const result = declarations[output.srcPath];
      output.contents = result?.contents || "";
      if (result.errors) {
        output.errors = result.errors;
      }
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
  const rewriteIds = (
    output: OutputFile,
    ids: Array<{ id: string; index: number }>,
    resolveExtensions: string[],
  ) => {
    const contents = output.contents;
    const edits: SourceMapEdit[] = [];
    for (const { id, index } of ids.sort((a, b) => b.index - a.index)) {
      const resolved = resolveId(output.path, id, resolveExtensions);
      if (resolved !== id) {
        edits.push({
          end: index + id.length,
          delta: resolved.length - id.length,
        });
        output.contents =
          output.contents.slice(0, index) +
          resolved +
          output.contents.slice(index + id.length);
      }
    }
    output.sourceMap = shiftSourceMap(output.sourceMap, contents, edits);
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
    const ids = [
      ...findStaticImports(output.contents),
      ...findExports(output.contents),
    ].flatMap(({ code, start, specifier }) =>
      specifier
        ? [{ id: specifier, index: start + code.lastIndexOf(specifier) }]
        : [],
    );
    ids.push(...findImportIds(output.contents));
    rewriteIds(output, ids, esmResolveExtensions);
  }
  const cjsResolveExtensions = ["", "/index.cjs", ".cjs"];
  for (const output of outputs.filter((o) => o.extension === ".cjs")) {
    // Reuse mlly's token filtering while preserving the original offsets.
    const importCode = output.contents.replace(
      /(^|[^\w$.])require\b/g,
      "$1import ",
    );
    rewriteIds(output, findImportIds(importCode), cjsResolveExtensions);
  }

  // Emit source maps after all output rewrites.
  const sourcemap = options.esbuild?.sourcemap;
  for (const output of sourcemap
    ? outputs.filter((o) => o.sourceMap && !o.skip)
    : []) {
    const sourceMap = JSON.parse(output.sourceMap) as { sources: string[] };
    const sourceMapDir = dirname(join(options.distDir, `${output.path}.map`));
    sourceMap.sources = sourceMap.sources.map((source) =>
      isAbsolute(source) ? relative(sourceMapDir, source) : source,
    );
    output.sourceMap = JSON.stringify(sourceMap);

    if (sourcemap !== "inline") {
      const path = `${output.path}.map`;
      const existing = outputs.find(
        (output) => !output.skip && output.path === path,
      );
      if (existing) {
        existing.contents = output.sourceMap;
        existing.raw = false;
      } else {
        outputs.push({ path, contents: output.sourceMap });
      }
    }
    if (sourcemap === "inline" || sourcemap === "both") {
      const encoded = Buffer.from(output.sourceMap).toString("base64");
      output.contents += `\n//# sourceMappingURL=data:application/json;base64,${encoded}`;
    } else if (sourcemap === true || sourcemap === "linked") {
      const sourceMapUrl = encodeURIComponent(
        `${basename(output.path)}.map`,
      ).replace(
        /[!'()*]/g,
        (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
      );
      output.contents += `\n//# sourceMappingURL=${sourceMapUrl}`;
    }
  }

  // Write outputs
  const writtenFiles: string[] = [];
  const errors: Array<{ filename: string; errors: TypeError[] }> = [];
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

        if (output.errors) {
          errors.push({ filename: outFile, errors: output.errors });
        }
      }),
  );

  return {
    errors,
    writtenFiles,
  };
}
