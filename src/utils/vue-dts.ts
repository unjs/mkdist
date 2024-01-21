import { createRequire } from "node:module";
import { CompilerOptions } from "typescript";
import { MkdistOptions } from "../make";
import { extractDeclarations } from "./dts";

const require = createRequire(import.meta.url);

const compilerOptions: CompilerOptions = {
  allowJs: true,
  declaration: true,
  incremental: true,
  skipLibCheck: true,
  strictNullChecks: true,
  emitDeclarationOnly: true,
};

export async function getVueDeclarations(
  vfs: Map<string, string>,
  opts?: MkdistOptions,
) {
  const fileMapping = getFileMapping(vfs);
  const srcFiles = Object.keys(fileMapping);
  const originFiles = Object.values(fileMapping);
  if (originFiles.length === 0) {
    return;
  }

  const vueTsc = await import("vue-tsc")
    .then((r) => r.default || r)
    .catch(() => undefined);
  if (!vueTsc) {
    console.warn(
      "[mkdist] Please install `vue-tsc` to generate Vue SFC declarations.",
    );
    return;
  }

  // Inside vue-tsc, `require` is used instead of `import`. In order to override `ts.sys`, it is necessary to import it in the same way as vue-tsc for them to refer to the same file.
  const ts =
    require("typescript") as typeof import("typescript/lib/tsserverlibrary");

  const tsHost = ts.createCompilerHost(compilerOptions);

  const _tsSysWriteFile = ts.sys.writeFile;
  ts.sys.writeFile = (filename, content) => {
    vfs.set(filename, content);
  };
  const _tsSysReadFile = ts.sys.readFile;
  ts.sys.readFile = (filename, encoding) => {
    if (vfs.has(filename)) {
      return vfs.get(filename);
    }
    return _tsSysReadFile(filename, encoding);
  };

  const program = vueTsc.createProgram({
    rootNames: srcFiles,
    options: compilerOptions,
    host: tsHost,
  });

  try {
    program.emit();
  } finally {
    ts.sys.writeFile = _tsSysWriteFile;
    ts.sys.readFile = _tsSysReadFile;
  }

  return extractDeclarations(vfs, originFiles, opts);
}

const SFC_EXT_RE = /\.vue\.[cm]?[jt]s$/;

function getFileMapping(vfs: Map<string, string>): Record<string, string> {
  const files: Record<string, string> = Object.create(null);
  for (const [srcPath] of vfs) {
    if (SFC_EXT_RE.test(srcPath)) {
      files[srcPath.replace(SFC_EXT_RE, ".vue")] = srcPath;
    }
  }
  return files;
}
