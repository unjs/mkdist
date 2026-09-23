import type { Loader } from "../loader";
import { jsLoader } from "./js";
import { postcssLoader } from "./postcss";
import { sassLoader } from "./sass";
import { vueLoader } from "./vue";

export const loaders = {
  js: jsLoader,
  vue: vueLoader,
  sass: sassLoader,
  postcss: postcssLoader,
};

export type LoaderName = keyof typeof loaders;

export const defaultLoaders: LoaderName[] = ["js", "vue", "sass", "postcss"];

export function resolveLoader(loader: LoaderName | Loader) {
  if (typeof loader === "string") {
    return loaders[loader];
  }
  return loader;
}

export function resolveLoaders(
  loaders: (LoaderName | Loader)[] = defaultLoaders,
) {
  return loaders
    .map((loaderName) => {
      const _loader = resolveLoader(loaderName);
      if (!_loader) {
        console.warn("Unknown loader:", loaderName);
      }
      return _loader;
    })
    .filter(Boolean) as Loader[];
}
