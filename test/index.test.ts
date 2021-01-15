import { resolve } from 'upath'
import { makeDist } from '../src/make'
import { createLoader } from '../src/loader'
import { vueLoader } from '../src/loaders'

describe('makedist', () => {
  it('makeDist', async () => {
    const rootDir = resolve(__dirname, 'fixture')
    const { writtenFiles } = await makeDist({ rootDir })
    expect(writtenFiles).toEqual([
      'dist/README.md',
      'dist/foo.js',
      'dist/index.js',
      'dist/types.d.ts',
      'dist/components/blank.vue',
      'dist/components/js.vue',
      'dist/components/ts.vue'
    ].map(f => resolve(rootDir, f)))
  })
})

describe('createLoader', () => {
  it('loadFile returns undefined for an unsupported file', async () => {
    const { loadFile } = createLoader()
    const results = await loadFile({
      extension: '.noth',
      getContents: () => new Error('this should not be called') as any,
      path: 'another.noth'
    })
    expect(results).toBeFalsy()
  })
  it('vueLoader handles no transpilation of script tag', async () => {
    const { loadFile } = createLoader({
      loaders: [vueLoader]
    })
    const results = await loadFile({
      extension: '.vue',
      getContents: () => '<script>Test</script>',
      path: 'test.vue'
    })
    expect(results).toBeFalsy()
  })
})
