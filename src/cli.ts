import mri from 'mri'
import { makeDist } from './index'

async function main () {
  const args = mri(process.argv.splice(2))

  if (args.help) {
    // eslint-disable-next-line no-console
    console.log('Usage: npx makedist [rootDir] [--src=src] [--dist=dist] [--format=cjs|esm]')
    process.exit(0)
  }

  const { writtenFiles } = await makeDist({
    rootDir: args._[0],
    srcDir: args.src,
    distDir: args.dist,
    format: args.format
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
