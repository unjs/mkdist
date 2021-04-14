export async function getDeclarations (input: Record<string, string>) {
  const vfs: Map<string, string> = new Map(Object.entries(input))

  const ts = await import('typescript')

  const compilerOptions = {
    allowJs: true,
    declaration: true,
    incremental: true,
    skipLibCheck: true,
    emitDeclarationOnly: true
  }
  const tsHost = ts.createCompilerHost!(compilerOptions)

  tsHost.writeFile = (fileName: string, declaration: string) => {
    vfs.set(fileName, declaration)
  }
  const _readFile = tsHost.readFile
  tsHost.readFile = (filename) => {
    if (vfs.has(filename)) { return vfs.get(filename) }
    return _readFile(filename)
  }

  const program = ts.createProgram!(Object.keys(input), compilerOptions, tsHost)
  await program.emit()

  const output: Record<string, string> = {}

  for (const filename in input) {
    const dtsFilename = filename.replace(/\.(ts|js)$/, '.d.ts')
    output[filename] = vfs.get(dtsFilename) || ''
  }

  return output
}
