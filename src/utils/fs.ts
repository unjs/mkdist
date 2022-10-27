import { pipeline } from 'stream/promises'
import { createReadStream, createWriteStream } from 'fs'

export function copyFileWithStream (srcPath: string, outPath: string) {
  const srcStream = createReadStream(srcPath)
  const outStream = createWriteStream(outPath)

  return pipeline(srcStream, outStream)
}
