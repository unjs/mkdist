# makedist

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

<!-- ![...](.github/banner.svg) -->

Lightweight file-to-file transpiler

## Features

- Vue SFC support (`<script>` tag transpilation)
- Typescript support (via [esbuild](https://github.com/evanw/esbuild))
- Automatic copying of assets

## Usage

```bash
npx makedist [rootDir] [--src=src] [--dist=dist] [--format=cjs|esm]
```

## Compared to `tsc` / `babel`

✅ Copies all assets (not just TS)

✅ Supports TypeScript for Vue SFC

✅ Faster, thanks to esbuild

🚧 (WIP) `.d.ts` generation

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/makedist?style=flat-square
[npm-version-href]: https://npmjs.com/package/makedist

[npm-downloads-src]: https://img.shields.io/npm/dm/makedist?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/makedist

[github-actions-src]: https://img.shields.io/github/workflow/status/nuxt-contrib/makedist/ci/main?style=flat-square
[github-actions-href]: https://github.com/nuxt-contrib/makedist/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/nuxt-contrib/makedist/main?style=flat-square
[codecov-href]: https://codecov.io/gh/nuxt-contrib/makedist
