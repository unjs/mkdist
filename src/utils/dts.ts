import type { CompilerOptions, CompilerHost } from 'typescript'

const compilerOptions: CompilerOptions = {
  allowJs: true,
  declaration: true,
  incremental: true,
  skipLibCheck: true,
  emitDeclarationOnly: true
}

let _ts: typeof import('typescript')
async function getTs () {
  if (!_ts) {
    try {
      _ts = await import('typescript')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[mkdist] Could not load `typescript` for generating types. Do you have it installed?')
      throw err
    }
  }
  return _ts
}

const vfs = new Map<string, string>()
let _tsHost: CompilerHost
async function getTsHost () {
  if (!_tsHost) {
    const ts = await getTs()
    _tsHost = ts.createCompilerHost!(compilerOptions)
  }

  // Use virtual filesystem
  _tsHost.writeFile = (fileName: string, declaration: string) => {
    vfs.set(fileName, declaration)
  }
  const _readFile = _tsHost.readFile
  _tsHost.readFile = (filename) => {
    if (vfs.has(filename)) { return vfs.get(filename) }
    return _readFile(filename)
  }

  return _tsHost
}

export async function getDeclaration(contents: string, filename = '_input.ts') {
  const dtsFilename = filename.replace(/\.(ts|js)$/, '.d.ts')
  if (vfs.has(dtsFilename)) {
    return vfs.get(dtsFilename)
  }
  try {
    const ts = await getTs()
    const host = await getTsHost()
    if (vfs.has(filename)) {
      throw new Error('Race condition for generating ' + filename)
    }
    vfs.set(filename, contents)
    const program = ts.createProgram!([filename], compilerOptions, host)
    await program.emit()
    const result = vfs.get(dtsFilename)
    vfs.delete(filename)
    return result
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Could not generate declaration file for ${filename}:`, err)
    return ''
  }
}
