import type { TransformOptions } from "esbuild";
import { vueLoader, jsLoader, sassLoader } from "./loaders";

export interface InputFile {
  path: string;
  extension: string;
  srcPath?: string;
  getContents: () => Promise<string> | string;
}

export interface OutputFile {
  /**
   * relative to distDir
   */
  path: string;
  srcPath?: string;
  extension?: string;
  contents?: string;
  declaration?: boolean;
  raw?: boolean;
  skip?: boolean;
}

export type LoaderResult = OutputFile[] | undefined;

export type LoadFile = (
  input: InputFile
) => LoaderResult | Promise<LoaderResult>;

export interface LoaderOptions {
  ext?: "mjs" | "js" | "ts";
  format?: "cjs" | "esm";
  declaration?: boolean;
  esbuild?: TransformOptions;
}

export interface LoaderContext {
  loadFile: LoadFile;
  options: LoaderOptions;
}

export type Loader = (
  input: InputFile,
  context: LoaderContext
) => LoaderResult | Promise<LoaderResult>;

export const defaultLoaders: Loader[] = [vueLoader, jsLoader, sassLoader];

export interface CreateLoaderOptions extends LoaderOptions {
  loaders?: Loader[];
}

export function createLoader(loaderOptions: CreateLoaderOptions = {}) {
  const loaders = loaderOptions.loaders || defaultLoaders;

  const loadFile: LoadFile = async function (input: InputFile) {
    const context: LoaderContext = {
      loadFile,
      options: loaderOptions,
    };
    for (const loader of loaders) {
      const outputs = await loader(input, context);
      if (outputs?.length) {
        return outputs;
      }
    }
    return [
      {
        path: input.path,
        srcPath: input.srcPath,
        raw: true,
      },
    ];
  };

  return {
    loadFile,
  };
}
