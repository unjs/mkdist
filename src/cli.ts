import mri from 'mri'
import { mkdist } from './index'

async function main () {
  const args = mri(process.argv.splice(2))

  if (args.help) {
    // eslint-disable-next-line no-console
    console.log('Usage: npx mkdist [rootDir] [--src=src] [--dist=dist] [--format=cjs|esm] [--emit-types=true|ts|false]')
    process.exit(0)
  }

  const { writtenFiles } = await mkdist({
    rootDir: args._[0],
    srcDir: args.src,
    distDir: args.dist,
    format: args.format,
    emitTypes: args['emit-types'] === 'ts' ? 'ts' : args['emit-types'] === 'true'
  })

  // eslint-disable-next-line no-console
  console.log(writtenFiles.map(f => `- ${f}`).join('\n'))

  process.exit(0)
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  })
