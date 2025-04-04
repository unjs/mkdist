import type { Loader } from "../loader";
import { jsLoader } from "./js";
import { vueLoader } from "./vue";
import { sassLoader } from "./sass";
import { postcssLoader } from "./postcss";

let cachedVueLoader: Loader | undefined;

export const loaders = {
  js: jsLoader,
  vue:
    cachedVueLoader ||
    (async (...args) => {
      // @ts-expect-error need to fix node module resolution types
      cachedVueLoader = await import("vue-sfc-transformer/mkdist")
        .then((r) => r.vueLoader)
        .catch(() => vueLoader);
      return cachedVueLoader(...args);
    }),
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
