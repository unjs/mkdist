import type { Loader } from '../loader'

export const vueLoader: Loader = async (input, { loadFile }) => {
  if (input.extension !== '.vue') {
    return
  }

  const contents = await input.getContents()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scriptBlock, attrs = '', _lastAttr, script] = contents.match(/<script((\s[^>\s]*)*)>([\S\s.]*?)<\/script>/) || []
  if (!scriptBlock || !script) {
    return
  }

  const [, lang = 'js'] = attrs.match(/lang="([a-z]*)"/) || []
  const extension = '.' + lang

  const files = await loadFile({
    getContents: () => script,
    path: `${input.path}${extension}`,
    srcPath: `${input.srcPath}${extension}`,
    extension
  }) || []

  const scriptFile = files.find(f => ['.js', '.mjs'].includes(f.extension!))
  if (!scriptFile) {
    return
  }

  const newAttrs = attrs.replace(new RegExp(`\\s?lang="${lang}"`), '')

  return [
    {
      path: input.path,
      contents: contents.replace(scriptBlock, `<script${newAttrs}>\n${scriptFile.contents}</script>`)
    },
    ...files.filter(f => f !== scriptFile)
  ]
}
