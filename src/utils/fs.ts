import { pipeline } from 'stream'
import { createReadStream, createWriteStream } from 'fs'

export function copyFileWithStream (srcPath: string, outPath: string) {
  const srcStream = createReadStream(srcPath)
  const outStream = createWriteStream(outPath)
  return new Promise((resolve, reject) => {
    pipeline(srcStream, outStream, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(undefined)
      }
    })
  })
}
