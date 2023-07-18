import { pipeline } from "node:stream";
import { createReadStream, createWriteStream } from "node:fs";

export function copyFileWithStream(sourcePath: string, outPath: string) {
  const sourceStream = createReadStream(sourcePath);
  const outStream = createWriteStream(outPath);
  return new Promise((resolve, reject) => {
    pipeline(sourceStream, outStream, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
