import { createRequire } from "node:module";
import { CompilerOptions, CreateProgramOptions } from "typescript";
import { readPackageJSON } from "pkg-types";
import { satisfies } from "semver";
import { normalize } from "pathe";
import { MkdistOptions } from "../make";
import { extractDeclarations } from "./dts";

const require = createRequire(import.meta.url);

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

  const pkgInfo = await readPackageJSON("vue-tsc").catch(() => {});
  if (!pkgInfo) {
    console.warn(
      "[mkdist] Please install `vue-tsc` to generate Vue SFC declarations.",
    );
    return;
  }

  const { version } = pkgInfo;
  switch (true) {
    case satisfies(version, "^1.8.27"): {
      await emitVueTscV1(vfs, opts.typescript.compilerOptions, srcFiles);
      break;
    }
    case satisfies(version, "~v2.0.0"): {
      await emitVueTscV2(vfs, opts.typescript.compilerOptions, srcFiles);
      break;
    }
    default: {
      await emitVueTscLatest(
        vfs,
        opts.typescript.compilerOptions,
        srcFiles,
        opts.rootDir!,
      );
    }
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

async function emitVueTscV1(
  vfs: Map<string, string>,
  compilerOptions: CompilerOptions,
  srcFiles: string[],
) {
  const vueTsc: typeof import("vue-tsc1") = await import("vue-tsc")
    .then((r) => r.default || r)
    .catch(() => undefined);

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

  try {
    const program = vueTsc.createProgram({
      rootNames: srcFiles,
      options: compilerOptions,
      host: tsHost,
    });

    const result = program.emit();
    if (result.diagnostics?.length) {
      console.error(ts.formatDiagnostics(result.diagnostics, tsHost));
    }
  } finally {
    ts.sys.writeFile = _tsSysWriteFile;
    ts.sys.readFile = _tsSysReadFile;
  }
}

async function emitVueTscV2(
  vfs: Map<string, string>,
  compilerOptions: CompilerOptions,
  srcFiles: string[],
) {
  const { resolve: resolveModule } = await import("mlly");
  const ts: typeof import("typescript") = await import("typescript").then(
    (r) => r.default || r,
  );
  const vueTsc = (await import(
    "vue-tsc"
  )) as unknown as typeof import("vue-tsc2.0");
  const requireFromVueTsc = createRequire(await resolveModule("vue-tsc"));
  const vueLanguageCore: typeof import("@vue/language-core2.0") =
    requireFromVueTsc("@vue/language-core");
  const volarTs: typeof import("@volar/typescript") =
    requireFromVueTsc("@volar/typescript");

  const tsHost = ts.createCompilerHost(compilerOptions);
  tsHost.writeFile = (filename, content) => {
    vfs.set(filename, vueTsc.removeEmitGlobalTypes(content));
  };
  const _tsReadFile = tsHost.readFile.bind(tsHost);
  tsHost.readFile = (filename) => {
    if (vfs.has(filename)) {
      return vfs.get(filename);
    }
    return _tsReadFile(filename);
  };
  const _tsFileExist = tsHost.fileExists.bind(tsHost);
  tsHost.fileExists = (filename) => {
    return vfs.has(filename) || _tsFileExist(filename);
  };
  const programOptions: CreateProgramOptions = {
    rootNames: srcFiles,
    options: compilerOptions,
    host: tsHost,
  };
  const createProgram = volarTs.proxyCreateProgram(
    ts,
    ts.createProgram,
    (ts, options) => {
      const vueLanguagePlugin = vueLanguageCore.createVueLanguagePlugin<string>(
        ts,
        (id) => id,
        () => "",
        (fileName) => {
          const fileMap = new Set();
          for (const vueFileName of options.rootNames.map((rootName) =>
            normalize(rootName),
          )) {
            fileMap.add(vueFileName);
          }
          return fileMap.has(fileName);
        },
        options.options,
        vueLanguageCore.resolveVueCompilerOptions({}),
      );
      return [vueLanguagePlugin];
    },
  );
  const program = createProgram(programOptions);
  const result = program.emit();
  if (result.diagnostics?.length) {
    console.error(ts.formatDiagnostics(result.diagnostics, tsHost));
  }
}

async function emitVueTscLatest(
  vfs: Map<string, string>,
  compilerOptions: CompilerOptions,
  srcFiles: string[],
  rootDir: string,
) {
  const { resolve: resolveModule } = await import("mlly");
  const ts: typeof import("typescript") = await import("typescript").then(
    (r) => r.default || r,
  );
  const requireFromVueTsc = createRequire(await resolveModule("vue-tsc"));
  const vueLanguageCore: typeof import("@vue/language-core") =
    requireFromVueTsc("@vue/language-core");
  const volarTs: typeof import("@volar/typescript") =
    requireFromVueTsc("@volar/typescript");

  const tsHost = ts.createCompilerHost(compilerOptions);
  tsHost.writeFile = (filename, content) => {
    vfs.set(filename, content);
  };
  const _tsReadFile = tsHost.readFile.bind(tsHost);
  tsHost.readFile = (filename) => {
    if (vfs.has(filename)) {
      return vfs.get(filename);
    }
    return _tsReadFile(filename);
  };
  const _tsFileExist = tsHost.fileExists.bind(tsHost);
  tsHost.fileExists = (filename) => {
    return vfs.has(filename) || _tsFileExist(filename);
  };

  const programOptions: CreateProgramOptions = {
    rootNames: srcFiles,
    options: compilerOptions,
    host: tsHost,
  };

  const createProgram = volarTs.proxyCreateProgram(
    ts,
    ts.createProgram,
    (ts, options) => {
      const vueLanguagePlugin = vueLanguageCore.createVueLanguagePlugin<string>(
        ts,
        options.options,
        vueLanguageCore.createParsedCommandLineByJson(
          ts,
          ts.sys,
          rootDir,
          {},
          undefined,
          true,
        ).vueOptions,
        (id) => id,
      );
      return [vueLanguagePlugin];
    },
  );

  const program = createProgram(programOptions);
  const result = program.emit();
  if (result.diagnostics?.length) {
    console.error(ts.formatDiagnostics(result.diagnostics, tsHost));
  }
}
