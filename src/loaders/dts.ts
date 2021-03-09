import type { CompilerOptions } from 'typescript'

export async function getDeclaration (contents: string, path = '_contents.ts') {
  let createCompilerHost: typeof import('typescript')['createCompilerHost']
  let createProgram: typeof import('typescript')['createProgram']
  try {
    ;({ createCompilerHost, createProgram } = await import('typescript'))
  } catch {
    console.warn('Could not load `typescript`. Do you have it installed?')
    return ''
  }

  try {
    const options: CompilerOptions = {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true
    }

    const files: Record<string, string> = {}
    const host = createCompilerHost!(options)
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

    const program = createProgram!([path], options, host)
    program.emit()

    return files[path.replace(/\.(ts|js)$/, '.d.ts')]
  } catch (e) {
    console.warn(`Could not generate declaration file for ${path}.`, e)
    return ''
  }
}
