import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import postcssNested from "postcss-nested";
import type { Loader, LoaderResult } from "../loader";

export interface PostcssLoaderOptions {}

export const postcssLoader: Loader = async (input, ctx) => {
  if (ctx.options.postcss === false || ![".css"].includes(input.extension)) {
    return;
  }

  const output: LoaderResult = [];

  const contents = await input.getContents();

  const transformed = await postcss(
    [
      ctx.options.postcss?.nested !== false &&
        postcssNested(ctx.options.postcss?.nested),
      ctx.options.postcss?.autoprefixer !== false &&
        autoprefixer(ctx.options.postcss?.autoprefixer),
      ctx.options.postcss?.cssnano !== false &&
        cssnano(ctx.options.postcss?.cssnano),
      ...(ctx.options.postcss?.plugins || []),
    ].filter(Boolean),
  ).process(contents, {
    ...ctx.options.postcss?.processOptions,
    from: input.srcPath,
  });

  output.push({
    contents: transformed.content,
    path: input.path,
    extension: ".css",
  });

  return output;
};
