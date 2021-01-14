import { startService, Service, TransformOptions } from 'esbuild'
import type { Loader } from '../loader'

let esbuildService: Promise<Service>

export function transform (input: string, options: TransformOptions) {
  if (!esbuildService) {
    esbuildService = startService()
    process.on('beforeExit', () => {
    /* istanbul ignore next */ esbuildService.then(s => s.stop())
    })
  }
  return esbuildService.then(s => s.transform(input, options))
}

export const esbuildLoader: Loader = async (input) => {
  if (!['.ts', '.js'].includes(input.extension)) {
    return
  }
  const contents = await input.getContents()
  const { code } = await transform(contents, {
    target: 'es2020',
    loader: input.extension.slice(1) as 'ts'
  })
  return [
    {
      contents: code,
      path: input.path,
      extension: '.js'
    }
  ]
}
