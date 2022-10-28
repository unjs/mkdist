import { transform } from 'esbuild'
import jiti from 'jiti'

import type { Loader, LoaderResult } from '../loader'

const DECLARATION_RE = /\.d\.[cm]?ts$/
const CM_LETTER_RE = /(?<=\.)(c|m)(?=[tj]s$)/

export const jsLoader: Loader = async (input, { options }) => {
  if (!['.ts', '.js', '.cjs', '.mjs', '.tsx', '.jsx'].includes(input.extension) || input.path.match(DECLARATION_RE)) {
    return
  }

  const output: LoaderResult = []

  let contents = await input.getContents()

  // declaration
  if (options.declaration && !input.srcPath?.match(DECLARATION_RE)) {
    const cm = input.srcPath?.match(CM_LETTER_RE)?.[0] || ''
    const extension = `.d.${cm}ts`
    output.push({
      contents,
      srcPath: input.srcPath,
      path: input.path,
      extension,
      declaration: true
    })
  }

  // typescript => js
  if (input.extension === '.ts') {
    contents = await transform(contents, { loader: 'ts' }).then(r => r.code)
  } else if (['.tsx', '.jsx'].includes(input.extension)) {
    contents = await transform(contents, {
      loader: input.extension === '.tsx' ? 'tsx' : 'jsx',
      jsxFactory: options.jsxFactory,
      jsxFragment: options.jsxFragment
    }).then(r => r.code)
  }

  // esm => cjs
  const isCjs = options.format === 'cjs'
  if (isCjs) {
    contents = jiti().transform({ source: contents, retainLines: false })
      .replace(/^exports.default = /mg, 'module.exports = ')
  }

  output.push({
    contents,
    path: input.path,
    extension: options.ext ? `.${options.ext}` : (isCjs ? '.js' : '.mjs')
  })

  return output
}
