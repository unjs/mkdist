import { startService, Service, TransformOptions } from 'esbuild'
import jiti from 'jiti'
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

export const jsLoader: Loader = async (input, { options }) => {
  if (!['.ts', '.js'].includes(input.extension) || input.path.endsWith('.d.ts')) {
    return
  }

  let contents = await input.getContents()

  // typescript => js
  if (input.extension === '.ts') {
    contents = await transform(contents, { loader: 'ts' }).then(r => r.code)
  }

  // esm => cjs
  if (options.format === 'cjs') {
    contents = jiti().transform({ source: contents, retainLines: false })
  }

  return [
    {
      contents,
      path: input.path,
      extension: '.js'
    }
  ]
}
