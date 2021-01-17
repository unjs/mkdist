import globby from 'globby'
import { resolve, extname, join, basename, dirname } from 'upath'
import { emptyDir, mkdirp, copyFile, readFile, writeFile } from 'fs-extra'
import { InputFile, CreateLoaderOptions, createLoader } from './loader'

interface mkdistOptions {
  rootDir?: string
  srcDir?: string
  distDir?: string
  format?: CreateLoaderOptions['format']
}

export async function mkdist (options: mkdistOptions /* istanbul ignore next */ = {}) {
  // Resolve srcDir and distDir relative to rootDir
  options.rootDir = resolve(process.cwd(), options.rootDir || '.')
  options.srcDir = resolve(options.rootDir, options.srcDir || 'src')
  options.distDir = resolve(options.rootDir, options.distDir || 'dist')

  // Setup dist
  await emptyDir(options.distDir)
  await mkdirp(options.distDir)

  const filePaths = await globby('**', { absolute: false, cwd: options.srcDir })

  const files: InputFile[] = filePaths.map((path) => {
    const srcPath = resolve(options.srcDir, path)
    return {
      path,
      srcPath,
      extension: extname(path),
      getContents: () => readFile(srcPath, { encoding: 'utf8' })
    }
  })

  const writtenFiles: string[] = []

  const { loadFile } = createLoader({
    format: options.format
  })

  for (const file of files) {
    const outputs = await loadFile(file)
    if (file.srcPath && (!outputs || !outputs.length)) {
      const outFile = join(options.distDir, file.path)
      await mkdirp(dirname(outFile))
      await copyFile(file.srcPath, outFile)
      writtenFiles.push(outFile)
    } else {
      for (const output of outputs /* istanbul ignore next */ || []) {
        let outFile = join(options.distDir, output.path)
        if (typeof output.extension === 'string') {
          outFile = join(dirname(outFile), basename(outFile, extname(outFile)) + output.extension)
        }
        await mkdirp(dirname(outFile))
        await writeFile(outFile, output.contents, 'utf8')
        writtenFiles.push(outFile)
      }
    }
  }

  return {
    writtenFiles
  }
}
