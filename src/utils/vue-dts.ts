import { CompilerOptions } from "typescript";
import { MkdistOptions } from "../make";
import { extractDeclarations } from "./dts";

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
    console.warn("Please install `vue-tsc` to generate Vue SFC declarations");
    return;
  }

  const ts = await import("typescript").then((r) => r.default || r);

  const tsHost = ts.createCompilerHost(compilerOptions);
  const _tsSysWriteFile = ts.sys.writeFile;
  ts.sys.writeFile = tsHost.writeFile = (
    fileName: string,
    declaration: string,
  ) => {
    vfs.set(fileName, declaration);
  };
  const _readFile = tsHost.readFile;
  tsHost.readFile = (filename) => {
    if (vfs.has(filename)) {
      return vfs.get(filename);
    }
    return _readFile(filename);
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
  }

  return extractDeclarations(vfs, originFiles, opts);
}

const SFC_EXT_RE = /\.vue\.[cm]?[jt]s$/;

function getFileMapping(vfs: Map<string, string>): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [srcPath] of vfs) {
    if (SFC_EXT_RE.test(srcPath)) {
      files[srcPath.replace(SFC_EXT_RE, ".vue")] = srcPath;
    }
  }
  return files;
}
