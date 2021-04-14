import type { Loader } from '../loader'

export const vueLoader: Loader = async (input, { loadFile }) => {
  if (input.extension !== '.vue') {
    return
  }

  const contents = await input.getContents()
  const [scriptBlock, attrs = '', script] = contents.match(/<script(\s[^>\s]*)*>([\S\s.]*?)<\/script>/) || []
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

  const scriptFile = files.find(f => f.extension === '.js')
  if (!scriptFile) {
    return
  }

  return [
    {
      path: input.path,
      contents: contents.replace(scriptBlock, `<script>\n${scriptFile.contents}</script>`)
    },
    ...files.filter(f => f !== scriptFile)
  ]
}
