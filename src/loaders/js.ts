import { transform } from "esbuild";
import jiti from "jiti";

import type { Loader, LoaderResult } from "../loader";

const DECLARATION_RE = /\.d\.[cm]?ts$/;
const CM_LETTER_RE = /(?<=\.)(c|m)(?=[jt]s$)/;

export const jsLoader: Loader = async (input, { options }) => {
  if (
    ![".ts", ".js", ".cjs", ".mjs", ".tsx", ".jsx"].includes(input.extension) ||
    DECLARATION_RE.test(input.path)
  ) {
    return;
  }

  const output: LoaderResult = [];

  let contents = await input.getContents();

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
  if (input.extension === ".ts") {
    contents = await transform(contents, {
      ...options.esbuild,
      loader: "ts",
    }).then((r) => r.code);
  } else if ([".tsx", ".jsx"].includes(input.extension)) {
    contents = await transform(contents, {
      loader: input.extension === ".tsx" ? "tsx" : "jsx",
      ...options.esbuild,
      jsxFactory: options.jsxFactory || "h",
      jsxFragment: options.jsxFragment || "Fragment",
    }).then((r) => r.code);
  }

  // esm => cjs
  const isCjs = options.format === "cjs";
  if (isCjs) {
    contents = jiti("")
      .transform({ source: contents, retainLines: false })
      .replace(/^exports.default = /gm, "module.exports = ");
  }

  let extension = isCjs ? ".js" : ".mjs";
  if (options.ext) {
    extension = options.ext.startsWith(".") ? options.ext : `.${options.ext}`;
  }

  output.push({
    contents,
    path: input.path,
    extension,
  });

  return output;
};
