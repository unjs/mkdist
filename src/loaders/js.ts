import { transform } from 'esbuild'
import jiti from 'jiti'

import type { Loader, LoaderResult } from '../loader'

export const jsLoader: Loader = async (input, { options }) => {
  if (!['.ts', '.js', '.mjs'].includes(input.extension) || input.path.endsWith('.d.ts')) {
    return
  }

  const output: LoaderResult = []

  let contents = await input.getContents()

  // declaration
  if (options.declaration && !input.srcPath?.endsWith('.d.ts')) {
    output.push({
      contents,
      srcPath: input.srcPath,
      path: input.path,
      extension: '.d.ts',
      declaration: true
    })
  }

  // typescript => js
  if (input.extension === '.ts') {
    contents = await transform(contents, { loader: 'ts' }).then(r => r.code)
  }

  // esm => cjs
  const isCjs = options.format === 'cjs'
  if (isCjs) {
    contents = jiti().transform({ source: contents, retainLines: false })
  }

  output.push({
    contents,
    path: input.path,
    extension: isCjs ? '.js' : '.mjs'
  })

  return output
}
