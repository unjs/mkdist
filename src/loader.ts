import { vueLoader, jsLoader } from './loaders'

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
  srcPath?: string
  extension?: string
  contents: string
  declaration?: boolean
}

export type LoaderResult = OutputFile[] | undefined

export type LoadFile = (input: InputFile) => LoaderResult | Promise<LoaderResult>

export interface LoaderContext {
  loadFile: LoadFile,
  options: {
    format?: 'cjs' | 'esm',
    declaration?: boolean
  }
}

export type Loader = (input: InputFile, context: LoaderContext)
  => LoaderResult | Promise<LoaderResult>

export const defaultLoaders: Loader[] = [vueLoader, jsLoader]

export interface CreateLoaderOptions {
  loaders?: Loader[]
  format?: LoaderContext['options']['format']
  declaration?: LoaderContext['options']['declaration']
}

export function createLoader (loaderOptions: CreateLoaderOptions = {}) {
  const loaders = loaderOptions.loaders || defaultLoaders

  const loadFile: LoadFile = async function (input: InputFile) {
    const context: LoaderContext = {
      loadFile,
      options: loaderOptions
    }
    for (const loader of loaders) {
      const outputs = await loader(input, context)
      if (outputs?.length) {
        return outputs
      }
    }
  }

  return {
    loadFile
  }
}
