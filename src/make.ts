import { resolve, extname, join, basename, dirname } from "pathe";
import fse from "fs-extra";
import { copyFileWithStream } from "./utils/fs";
import { InputFile, LoaderOptions, createLoader, OutputFile } from "./loader";
import { getDeclarations } from "./utils/dts";

export interface MkdistOptions extends LoaderOptions {
  rootDir?: string;
  srcDir?: string;
  pattern?: string | string[];
  distDir?: string;
  cleanDist?: boolean;
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
  });

  // Use loaders to get output files
  const outputs: OutputFile[] = [];
  for (const file of files) {
    outputs.push(...((await loadFile(file)) || []));
  }

  const outputPaths = new Set(outputs.map((o) => o.path));
  const esmOutputs: OutputFile[] = [];
  const cjsOutputs: OutputFile[] = [];
  const dtsInputs = new Map();
  const finalOutputs = new Map();

  // Process outputs
  for (const output of outputs) {
    if (output.skip) {
      continue;
    }
    // Normalize output extensions
    if (output.extension) {
      const originPath = output.path;
      const renamed =
        basename(originPath, extname(originPath)) + output.extension;
      output.path = join(dirname(originPath), renamed);
      if (output.path !== originPath) {
        // Avoid overriding files with original extension (e.g. manual declaration)
        if (outputPaths.has(output.path)) {
          continue;
        }
        outputPaths.delete(originPath);
        outputPaths.add(output.path);
      }
    }

    finalOutputs.set(join(options.distDir, output.path), output);

    switch (output.type) {
      case "mjs":
        esmOutputs.push(output);
        break;
      case "cjs":
        cjsOutputs.push(output);
        break;
      case "dts":
        // Prepare declarations
        dtsInputs.set(output.srcPath, output);
        if (options.declarationMap) {
          const dtsMap = { path: output.path + ".map" };
          finalOutputs.set(join(options.distDir, dtsMap.path), dtsMap);
        }
        break;
    }
  }

  // Generate declarations
  if (dtsInputs.size > 0) {
    await getDeclarations(dtsInputs, finalOutputs, options);
  }

  // Resolve relative imports
  const resolveId = (from: string, id = "", resolveExtensions: string[]) => {
    if (id.startsWith(".")) {
      for (const extension of resolveExtensions) {
        // TODO: Resolve relative ../ via ufo
        if (outputPaths.has(join(dirname(from), id + extension))) {
          return id + extension;
        }
      }
    }
    return id;
  };
  const esmResolveExtensions = ["", "/index.mjs", "/index.js", ".mjs", ".ts"];
  for (const output of esmOutputs) {
    // Resolve import statements
    output.contents = output.contents.replace(
      /(import|export)(.* from ["'])(.*)(["'])/g,
      (_, type, head, id, tail) =>
        type + head + resolveId(output.path, id, esmResolveExtensions) + tail
    );
  }
  const cjsResolveExtensions = ["", "/index.cjs", ".cjs"];
  for (const output of cjsOutputs) {
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

  const writePromises = [];
  for (const [dstPath, output] of finalOutputs) {
    writePromises.push(writeFile(dstPath, output));
  }
  const writtenFiles = await Promise.all(writePromises);

  return {
    writtenFiles,
  };
}

const writeFile = async (dstPath: string, output: OutputFile) => {
  await fse.mkdirp(dirname(dstPath));
  await (output.type === "raw"
    ? copyFileWithStream(output.srcPath, dstPath)
    : fse.writeFile(dstPath, output.contents || ""));
  return dstPath;
};
