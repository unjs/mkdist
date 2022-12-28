import type { Loader, LoaderResult } from "../loader";

export const sassLoader: Loader = async (input, { options }) => {
  if (![".sass", ".scss"].includes(input.extension)) {
    return;
  }

  const compileString = await import("sass").then(r => r.compileString || r.default.compileString);

  const output: LoaderResult = [];

  const contents = await input.getContents();

  output.push({
    contents: compileString(contents).css,
    path: input.path,
    type: "sass",
    extension: `.${options.ext || "css"}`
  });

  return output;
};
