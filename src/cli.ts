import { makeDist } from './index'

async function main () {
  const args = process.argv.splice(2)
  const [rootDir] = args

  const { writtenFiles } = await makeDist({
    rootDir
  })

  // eslint-disable-next-line no-console
  console.log(writtenFiles.map(f => `- ${f}`).join('\n'))

  process.exit(0)
}

main()
  .catch((err) => {
    console.error(err) // eslint-disable-line no-console
    process.exit(1)
  })
