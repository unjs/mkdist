import { transform } from "esbuild";
import jiti from "jiti";

import type { Loader, LoaderResult } from "../loader";

const DECLARATION_RE = /\.d\.[cm]?ts$/;
const CM_LETTER_RE = /(?<=\.)(c|m)(?=[jt]s$)/;

const KNOWN_EXT_RE = /\.(c|m)?[jt]sx?$/;
const INLINE_SOURCE_MAP_RE =
  /\n?\/\/# sourceMappingURL=data:application\/json(?:;charset=utf-8)?;base64,([^\n]+)\n?$/;

const TS_EXTS = new Set([".ts", ".mts", ".cts"]);

export const jsLoader: Loader = async (input, { options }) => {
  if (!KNOWN_EXT_RE.test(input.path) || DECLARATION_RE.test(input.path)) {
    return;
  }

  const output: LoaderResult = [];

  let contents = await input.getContents();
  let sourceMapping = "";

  // declaration
  if (options.declaration && !input.srcPath?.match(DECLARATION_RE)) {
    const cm = input.srcPath?.match(CM_LETTER_RE)?.[0] || "";
    const extension = `.d.${cm}ts`;
    output.push({
      contents,
      srcPath: input.srcPath,
      path: input.path,
      extension,
      declaration: true,
    });
  }

  // typescript => js
  const isCjs = options.format === "cjs";
  const sourceMap = options.esbuild?.sourcemap;
  const sourceMapEnabled =
    sourceMap === true ||
    sourceMap === "linked" ||
    sourceMap === "inline" ||
    sourceMap === "external" ||
    sourceMap === "both";
  const sourcemap = sourceMapEnabled ? "external" : sourceMap;
  let loader: "ts" | "tsx" | "jsx" | "js" | undefined;
  if (TS_EXTS.has(input.extension)) {
    loader = "ts";
  } else if (input.extension === ".tsx") {
    loader = "tsx";
  } else if (input.extension === ".jsx") {
    loader = "jsx";
  } else if (sourcemap) {
    loader = "js";
  }
  if (loader) {
    const result = await transform(contents, {
      ...options.esbuild,
      sourcemap,
      sourcefile: input.srcPath,
      loader,
    });
    contents = result.code;
    sourceMapping = result.map;
  }

  // esm => cjs
  if (isCjs) {
    const inputSourceMap = sourceMapEnabled
      ? JSON.parse(sourceMapping)
      : undefined;
    const sourceRoot = inputSourceMap?.sourceRoot;
    // Babel resolves sourceRoot into each source during map composition.
    if (inputSourceMap) {
      delete inputSourceMap.sourceRoot;
    }
    const stackTraceLimit = Error.stackTraceLimit;
    try {
      // Prevent caller source-map hooks from breaking Jiti's synchronous transform.
      if (sourceMapEnabled) {
        Error.stackTraceLimit = 0;
      }
      contents = jiti(
        "",
        sourceMapEnabled
          ? {
              cache: false,
              sourceMaps: true,
              transformOptions: {
                babel: { inputSourceMap },
              },
            }
          : undefined,
      ).transform({
        source: contents,
        retainLines: false,
        ...(sourceMapEnabled && { filename: input.path }),
      });
    } finally {
      Error.stackTraceLimit = stackTraceLimit;
    }

    if (sourceMapEnabled) {
      const match = contents.match(INLINE_SOURCE_MAP_RE);
      if (!match || match.index === undefined) {
        throw new Error(
          `[mkdist] Failed to generate source map for ${input.path}`,
        );
      }
      sourceMapping = Buffer.from(match[1], "base64").toString("utf8");
      if (sourceRoot !== undefined) {
        const parsed = JSON.parse(sourceMapping);
        parsed.sourceRoot = sourceRoot;
        sourceMapping = JSON.stringify(parsed);
      }
      contents = contents.slice(0, match.index);
    }
    const replaceWith = (replacement: string) => (value: string) =>
      sourceMapEnabled ? replacement.padEnd(value.length) : replacement;
    contents = contents
      .replace("exports.default = void 0;", replaceWith(""))
      .replace("module.exports = void 0;", replaceWith(""))
      .replace(/^exports.default = /gm, replaceWith("module.exports = "))
      .replace(
        /^var _default = exports.default = /gm,
        replaceWith("module.exports = "),
      );
  }

  let extension = isCjs ? ".js" : ".mjs"; // TODO: Default to .cjs in next major version
  if (options.ext) {
    extension = options.ext.startsWith(".") ? options.ext : `.${options.ext}`;
  }

  output.push({
    contents,
    sourceMap: sourceMapping || undefined,
    path: input.path,
    extension,
  });

  return output;
};
