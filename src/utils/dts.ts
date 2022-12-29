import type { CompilerOptions } from "typescript";
import type { OutputFile } from "../loader";
import type { MkdistOptions } from "../make";

export async function getDeclarations (input: Map<string, OutputFile>, output: Map<string, OutputFile>, options: MkdistOptions) {
  const ts = await import("typescript").then(r => r.default || r);

  const compilerOptions: CompilerOptions = {
    allowJs: true,
    declaration: true,
    declarationMap: options.declarationMap,
    declarationDir: options.distDir,
    rootDir: options.srcDir,
    skipLibCheck: true,
    strictNullChecks: true,
    emitDeclarationOnly: true
  };
  const tsHost = ts.createCompilerHost(compilerOptions);

  const _readFile = tsHost.readFile;
  tsHost.readFile = (filename) => {
    const i = input.get(filename);
    if (i) {
      return i.contents || "";
    }
    return _readFile(filename);
  };

  tsHost.writeFile = (filename: string, contents: string) => {
    const o = output.get(filename);
    if (o) {
      o.contents = contents;
    }
  };

  const program = ts.createProgram([...input.keys()], compilerOptions, tsHost);
  program.emit();
}
