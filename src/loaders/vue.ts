import type { Loader, LoaderResult } from '../loader'

export const vueLoader: Loader = async (input, ctx) => {
  if (input.extension !== '.vue') {
    return
  }

  const output: LoaderResult = [{
    path: input.path,
    contents: await input.getContents()
  }]

  let earlyReturn = true

  for (const blockLoader of [sassLoader, scriptLoader]) {
    const result = await blockLoader({ ...input, getContents: () => output[0].contents! }, ctx)
    if (!result) { continue }

    earlyReturn = false
    const [vueFile, ...files] = result
    output[0] = vueFile
    output.push(...files)
  }

  if (earlyReturn) { return }

  return output
}

interface BlockLoaderOptions {
  type: 'script' | 'style' | 'template'
  outputLang: string
  defaultLang?: string
  validExtensions?: string[]
  exclude?: RegExp[]
}

const vueBlockLoader = (opts: BlockLoaderOptions): Loader => async (input, { loadFile }) => {
  const contents = await input.getContents()

  const BLOCK_RE = new RegExp(`<${opts.type}((\\s[^>\\s]*)*)>([\\S\\s.]*?)<\\/${opts.type}>`)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [block, attrs = '', _, blockContents] = contents.match(BLOCK_RE) || []

  if (!block || !blockContents) {
    return
  }

  if (opts.exclude?.some(re => re.test(attrs))) {
    return
  }

  const [, lang = opts.outputLang] = attrs.match(/lang="([a-z]*)"/) || []
  const extension = '.' + lang

  const files = await loadFile({
    getContents: () => blockContents,
    path: `${input.path}${extension}`,
    srcPath: `${input.srcPath}${extension}`,
    extension
  }) || []

  const blockOutputFile = files.find(f => f.extension === `.${opts.outputLang}` || opts.validExtensions?.includes(f.extension!))
  if (!blockOutputFile) { return }

  const newAttrs = attrs.replace(new RegExp(`\\s?lang="${lang}"`), '')
  return [
    {
      path: input.path,
      contents: contents.replace(block, `<${opts.type}${newAttrs}>\n${blockOutputFile.contents?.trim()}\n</${opts.type}>`)
    },
    ...files.filter(f => f !== blockOutputFile)
  ]
}

const sassLoader = vueBlockLoader({
  outputLang: 'css',
  type: 'style'
})

const scriptLoader = vueBlockLoader({
  outputLang: 'js',
  type: 'script',
  exclude: [/\bsetup\b/],
  validExtensions: ['.js', '.mjs']
})
