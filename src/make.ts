import globby from 'globby'
import { resolve, extname, join, basename, dirname } from 'upath'
import { emptyDir, mkdirp, copyFile, readFile, writeFile, unlink } from 'fs-extra'
import { InputFile, LoaderOptions, createLoader, OutputFile, LoaderResult } from './loader'
import { getDeclarations } from './utils/dts'

export interface MkdistOptions extends LoaderOptions {
  rootDir?: string
  srcDir?: string
  distDir?: string
  cleanDist?: boolean
}

export async function mkdist (options: MkdistOptions /* istanbul ignore next */ = {}) {
  // Resolve srcDir and distDir relative to rootDir
  options.rootDir = resolve(process.cwd(), options.rootDir || '.')
  options.srcDir = resolve(options.rootDir, options.srcDir || 'src')
  options.distDir = resolve(options.rootDir, options.distDir || 'dist')

  // Setup dist
  if (options.cleanDist !== false) {
    await unlink(options.distDir).catch(() => {})
    await emptyDir(options.distDir)
    await mkdirp(options.distDir)
  }

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
    format: options.format,
    ext: options.ext,
    declaration: options.declaration
  })

  const writeOutput = async (output: OutputFile) => {
    let outFile = join(options.distDir, output.path)
    if (typeof output.extension === 'string') {
      outFile = join(dirname(outFile), basename(outFile, extname(outFile)) + output.extension)
    }
    await mkdirp(dirname(outFile))
    await writeFile(outFile, output.contents, 'utf8')
    writtenFiles.push(outFile)
  }

  const declarations: LoaderResult = []
  for (const file of files) {
    const outputs = await loadFile(file)
    if (file.srcPath && (!outputs || !outputs.length)) {
      const outFile = join(options.distDir, file.path)
      await mkdirp(dirname(outFile))
      await copyFile(file.srcPath, outFile)
      writtenFiles.push(outFile)
    } else {
      for (const output of outputs /* istanbul ignore next */ || []) {
        if (output.declaration) {
          declarations.push(output)
          continue
        }
        await writeOutput(output)
      }
    }
  }

  if (declarations.length) {
    const input: Record<string, string> = {}
    for (const d of declarations) {
      input[d.srcPath!] = d.contents
    }
    const res = await getDeclarations(input)
    for (const d of declarations) {
      if (res[d.srcPath!]) {
        d.contents = res[d.srcPath!]
        await writeOutput(d)
      }
    }
  }

  return {
    writtenFiles
  }
}
