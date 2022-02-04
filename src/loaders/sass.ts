import { compileString } from 'sass'

import type { Loader, LoaderResult } from '../loader'

export const sassLoader: Loader = async (input, { options }) => {
  if (!['.sass', '.scss'].includes(input.extension)) {
    return
  }

  const output: LoaderResult = []

  const contents = await input.getContents()

  output.push({
    contents: compileString(contents).css,
    path: input.path,
    extension: `.${options.ext || 'css'}`
  })

  return output
}
