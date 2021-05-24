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

  // Scan input files
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

  // Create loader
  const { loadFile } = createLoader({
    format: options.format,
    ext: options.ext,
    declaration: options.declaration
  })

  // Use loaders to get output files
  const outputs: OutputFile[] = []
  for (const file of files) {
    outputs.push(...await loadFile(file) || [])
  }

  // Generate declarations
  const dtsOutputs = outputs.filter(o => o.declaration)
  if (dtsOutputs.length) {
    const declarations = await getDeclarations(new Map(dtsOutputs.map(o => [o.srcPath!, o.contents || ''])))
    for (const output of dtsOutputs) {
      output.contents = declarations[output.srcPath!] || ''
    }
  }

  // Write outputs
  const writtenFiles: string[] = []
  await Promise.all(outputs.map(async (output) => {
    let outFile = join(options.distDir, output.path)
    if (typeof output.extension === 'string') {
      outFile = join(dirname(outFile), basename(outFile, extname(outFile)) + output.extension)
    }
    await mkdirp(dirname(outFile))
    if (output.raw) {
      await copyFile(output.srcPath!, outFile)
    } else {
      await writeFile(outFile, output.contents, 'utf8')
    }
    writtenFiles.push(outFile)
  }))

  return {
    writtenFiles
  }
}
