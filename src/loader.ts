import { vueLoader, esbuildLoader } from './loaders'

export interface InputFile {
  path: string
  extension: string
  srcPath?: string
  getContents: () => Promise<string> | string
}

export interface OutputFile {
  /**
   * relative to distDir
   */
  path: string
  extension?: string
  contents: string
}

export type LoaderResult = OutputFile[] | undefined

export type LoadFile = (input: InputFile) => LoaderResult | Promise<LoaderResult>

export type Loader = (input: InputFile, loadFile: LoadFile)
  => LoaderResult | Promise<LoaderResult>

export const defaultLoaders: Loader[] = [vueLoader, esbuildLoader]

export interface CreateLoaderOptions {
  loaders?: Loader[]
}

export function createLoader (loaderOptions: CreateLoaderOptions = {}) {
  const loaders = loaderOptions.loaders || defaultLoaders

  const loadFile: LoadFile = async function (input: InputFile) {
    for (const loader of loaders) {
      const outputs = await loader(input, loadFile)
      if (outputs?.length) {
        return outputs
      }
    }
  }

  return {
    loadFile
  }
}
