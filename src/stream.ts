import { pipeline } from 'stream/promises'
import { createReadStream, createWriteStream } from 'fs'

export const copyFileInStream = (srcPath: string, outPath: string) => {
  const srcStream = createReadStream(srcPath)
  const outStream = createWriteStream(outPath, { encoding: 'utf-8' })

  return pipeline(srcStream, outStream)
}
