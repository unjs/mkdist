import { findStaticImports, findExports, findTypeExports } from "mlly";
import type { TSConfig } from "pkg-types";
import type { MkdistOptions } from "../make";

export async function normalizeCompilerOptions(
  _options: TSConfig["compilerOptions"],
) {
  const ts = await import("typescript").then((r) => r.default || r);
  return ts.convertCompilerOptionsFromJson(_options, process.cwd()).options;
}

export async function getDeclarations(
  vfs: Map<string, string>,
  opts?: MkdistOptions,
) {
  const ts = await import("typescript").then((r) => r.default || r);

  const inputFiles = [...vfs.keys()];

  const tsHost = ts.createCompilerHost(opts.typescript.compilerOptions);

  tsHost.writeFile = (fileName: string, declaration: string) => {
    vfs.set(fileName, declaration);
  };
  const _readFile = tsHost.readFile;
  tsHost.readFile = (filename) => {
    if (vfs.has(filename)) {
      return vfs.get(filename);
    }
    return _readFile(filename);
  };

  const program = ts.createProgram(
    inputFiles,
    opts.typescript.compilerOptions,
    tsHost,
  );
  const result = program.emit();
  if (result.diagnostics?.length) {
    console.error(ts.formatDiagnostics(result.diagnostics, tsHost));
  }

  return extractDeclarations(vfs, inputFiles, opts);
}

export function extractDeclarations(
  vfs: Map<string, string>,
  inputFiles: string[],
  opts?: MkdistOptions,
) {
  const output: Record<string, string> = {};

  for (const filename of inputFiles) {
    const dtsFilename = filename.replace(/\.(m|c)?(ts|js)x?$/, ".d.$1ts");
    let contents = vfs.get(dtsFilename) || "";
    if (opts?.addRelativeDeclarationExtensions) {
      const ext =
        filename.match(/\.(m|c)?(ts|js)$/)?.[0].replace(/ts$/, "js") || ".js";
      const imports = findStaticImports(contents);
      const exports = findExports(contents);
      const typeExports = findTypeExports(contents);
      for (const spec of [...exports, ...typeExports, ...imports]) {
        if (!spec.specifier || !/^\.{1,2}[/\\]/.test(spec.specifier)) {
          continue;
        }
        // add file extension for relative paths (`.js` will match the `.d.ts` extension we emit)
        contents = contents.replace(
          spec.code,
          spec.code.replace(spec.specifier, spec.specifier + ext),
        );
      }
    }
    output[filename] = contents;

    vfs.delete(filename);
  }

  return output;
}
