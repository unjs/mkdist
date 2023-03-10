import { findStaticImports, findExports, findTypeExports } from "mlly";

interface GetDeclarationsOptions {
  addRelativeDeclarationExtensions?: boolean;
}

export async function getDeclarations(
  vfs: Map<string, string>,
  opts?: GetDeclarationsOptions
) {
  const ts = await import("typescript").then((r) => r.default || r);

  const inputFiles = [...vfs.keys()];

  const compilerOptions = {
    allowJs: true,
    declaration: true,
    incremental: true,
    skipLibCheck: true,
    strictNullChecks: true,
    emitDeclarationOnly: true,
  };
  const tsHost = ts.createCompilerHost(compilerOptions);

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

  const program = ts.createProgram(inputFiles, compilerOptions, tsHost);
  await program.emit();

  const output: Record<string, string> = {};

  for (const filename of inputFiles) {
    const dtsFilename = filename.replace(/\.(m|c)?(ts|js)$/, ".d.$1ts");
    let contents = vfs.get(dtsFilename) || "";
    if (opts?.addRelativeDeclarationExtensions) {
      const ext = filename.match(/\.(m|c)?(ts|js)$/)?.[0].replace(/ts$/, 'js') || ".js"
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
          spec.code.replace(spec.specifier, spec.specifier + ext)
        );
      }
    }
    output[filename] = contents;
  }

  return output;
}
