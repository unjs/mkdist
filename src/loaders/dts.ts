import type { CompilerOptions } from 'typescript'

export async function getDeclaration (contents: string, path = '_contents.ts') {
  try {
    const { createCompilerHost, createProgram } = await import('typescript')
    const options: CompilerOptions = {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true
    }

    const files: Record<string, string> = {}
    const host = createCompilerHost(options)
    host.writeFile = (fileName: string, declaration: string) => {
      files[fileName] = declaration
    }
    const { readFile } = host
    host.readFile = (filename) => {
      if (filename === path) {
        return contents
      }
      return readFile(filename)
    }

    const program = createProgram([path], options, host)
    program.emit()

    return files[path.replace(/\.(ts|js)$/, '.d.ts')]
  } catch {
    return ''
  }
}
