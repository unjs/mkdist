import { resolve, extname, join, basename, dirname } from 'pathe'
import fse from 'fs-extra'
import { copyFileInStream } from './utils/stream'
import { InputFile, LoaderOptions, createLoader, OutputFile } from './loader'
import { getDeclarations } from './utils/dts'

export interface MkdistOptions extends LoaderOptions {
  rootDir?: string
  srcDir?: string
  pattern?: string | string[]
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
    await fse.unlink(options.distDir).catch(() => { })
    await fse.emptyDir(options.distDir)
    await fse.mkdirp(options.distDir)
  }

  // Scan input files
  const { globby } = await import('globby')
  const filePaths = await globby(options.pattern || '**', { absolute: false, cwd: options.srcDir })
  const files: InputFile[] = filePaths.map((path) => {
    const srcPath = resolve(options.srcDir!, path)
    return {
      path,
      srcPath,
      extension: extname(path),
      getContents: () => fse.readFile(srcPath, { encoding: 'utf8' })
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

  // Normalize output extensions
  for (const output of outputs.filter(o => o.extension)) {
    const renamed = basename(output.path, extname(output.path)) + output.extension
    output.path = join(dirname(output.path), renamed)
    // Avoid overriding files with original extension
    if (outputs.find(o => o !== output && o.path === output.path)) {
      output.skip = true
    }
  }

  // Generate declarations
  const dtsOutputs = outputs.filter(o => o.declaration && !o.skip)
  if (dtsOutputs.length) {
    const declarations = await getDeclarations(new Map(dtsOutputs.map(o => [o.srcPath!, o.contents || ''])))
    for (const output of dtsOutputs) {
      output.contents = declarations[output.srcPath!] || ''
    }
  }

  // Resolve relative imports
  const outPaths = new Set(outputs.map(o => o.path))
  const resolveId = (from: string, id: string = '', resolveExts: string[]) => {
    if (!id.startsWith('.')) {
      return id
    }
    for (const ext of resolveExts) {
      // TODO: Resolve relative ../ via ufo
      if (outPaths.has(join(dirname(from), id + ext))) {
        return id + ext
      }
    }
    return id
  }
  const esmResolveExts = ['', '/index.mjs', '/index.js', '.mjs', '.ts']
  for (const output of outputs.filter(o => o.extension === '.mjs')) {
    // Resolve import statements
    output.contents = output.contents!.replace(
      /(import|export)(.* from ['"])(.*)(['"])/g,
      (_, type, head, id, tail) => type + head + resolveId(output.path, id, esmResolveExts) + tail
    )
  }
  const cjsResolveExts = ['', '/index.cjs', '.cjs']
  for (const output of outputs.filter(o => o.extension === '.cjs')) {
    // Resolve require statements
    output.contents = output.contents!.replace(
      /require\((['"])(.*)(['"])\)/g,
      (_, head, id, tail) => 'require(' + head + resolveId(output.path, id, cjsResolveExts) + tail + ')'
    )
  }

  // Write outputs
  const writtenFiles: string[] = []
  await Promise.all(outputs.filter(o => !o.skip).map(async (output) => {
    const outFile = join(options.distDir!, output.path)
    await fse.mkdirp(dirname(outFile))
    if (output.raw) {
      await copyFileInStream(output.srcPath!, outFile)
    } else {
      await fse.writeFile(outFile, output.contents, 'utf8')
    }
    writtenFiles.push(outFile)
  }))

  return {
    writtenFiles
  }
}
