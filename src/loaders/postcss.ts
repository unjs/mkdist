import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import postcssNested from "postcss-nested";
import type { Loader, LoaderResult } from "../loader";

console.log(postcss);

export const postcssLoader: Loader = async (input) => {
  if (![".css"].includes(input.extension)) {
    return;
  }

  const output: LoaderResult = [];

  const contents = await input.getContents();

  const transformed = await postcss([
    postcssNested(),
    autoprefixer(),
    cssnano(),
  ]).process(contents, {
    from: input.srcPath,
  });

  output.push({
    contents: transformed.content,
    path: input.path,
    extension: ".css",
  });

  return output;
};
