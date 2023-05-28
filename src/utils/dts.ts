import { findStaticImports, findExports, findTypeExports } from "mlly";
import type { CompilerOptions } from "typescript";

interface GetDeclarationsOptions {
  addRelativeDeclarationExtensions?: boolean;
}

const VUE_FILE_EXT_RE = /\.vue\.\S+$/

export async function getDeclarations(
  vfs: Map<string, string>,
  opts?: GetDeclarationsOptions
) {
  const ts = await import("typescript").then((r) => r.default || r);

  const inputFiles = [...vfs.keys()];
  const { vue: inputVueFiles, rest: inputRestFiles } = mapFiles(inputFiles, {
    vue: {
      src: VUE_FILE_EXT_RE,
      format: (filename: string) => filename.replace(VUE_FILE_EXT_RE, '.vue')
    },
  });

  const compilerOptions: CompilerOptions = {
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

  const program = ts.createProgram(inputRestFiles, compilerOptions, tsHost);
  await program.emit();

  if (inputVueFiles && inputVueFiles.length) {
    const programVue = (await import("vue-tsc")).createProgram({
      rootNames: inputVueFiles,
      options: compilerOptions,
      host: tsHost,
    });
    await programVue.emit();
  }

  const output: Record<string, string> = {};

  for (const filename of inputFiles) {
    const dtsFilename = filename.replace(/\.(m|c)?(ts|js)$/, ".d.$1ts");
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
          spec.code.replace(spec.specifier, spec.specifier + ext)
        );
      }
    }
    output[filename] = contents;
  }

  return output;
}

function mapFiles<TMapping extends Record<string, RegExp | { src: RegExp; format: (filename: string) => string }>>(
  inputFiles: string[],
  mapping: TMapping
): {
  [K in keyof TMapping]: string[];
} & {
  rest: string[];
} {
  const result = {} as any;

  for (const filename of inputFiles) {
    for (const [key, item] of Object.entries(mapping)) {
      const re = 'src' in item ? item.src : item
      const format = 'src' in item ? item.format : undefined

      if (re.test(filename)) {
        (result[key] ||= []).push(format ? format(filename) : filename);
      } else {
        (result.rest ||= []).push(filename);
      }
    }
  }

  return result;
}
