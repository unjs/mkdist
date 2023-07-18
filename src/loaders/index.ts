import type { Loader } from "../loader";
import { jsLoader } from "./js";
import { vueLoader } from "./vue";
import { sassLoader } from "./sass";

export const loaders = {
  js: jsLoader,
  vue: vueLoader,
  sass: sassLoader,
};

export type LoaderName = keyof typeof loaders;

export const defaultLoaders: LoaderName[] = ["js", "vue", "sass"];

export function resolveLoader(loader: LoaderName | Loader) {
  if (typeof loader === "string") {
    return loaders[loader];
  }
  return loader;
}

export function resolveLoaders(
  loaders: (LoaderName | Loader)[] = defaultLoaders
) {
  return loaders.map((loader) => resolveLoader(loader)).filter(Boolean);
}
