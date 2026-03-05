# mkdist

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

<!-- ![...](.github/banner.svg) -->

> Lightweight file-to-file transformer

✅ Copies all assets

✅ Supports [Vue Single File Components](https://vuejs.org/v2/guide/single-file-components.html)

✅ Fast and minimal transform by [esbuild](https://github.com/evanw/esbuild)

✅ `.d.ts` generation for `.ts`, `.js` and `.vue` files

✅ Support [postcss](https://postcss.org/) ([autoprefixer](https://github.com/postcss/autoprefixer), [cssnano](https://cssnano.co/) and [postcss-nested](https://npmx.dev/package/postcss-nested) enabled out of the box!)

## ❓ Why?

Bundling libraries isn't always the best choice:

- We lose original file structure
- We lose modern syntax by transpiling in bundle
- We lose critical-css by extracting css to a global dist (vue)
- Dependencies will be always imported from bundle even if not used (a second bundling step might fix this but it usually won't happen in development and for dependencies with side-effects)

While there are tools like [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) and [@babel/cli](https://babeljs.io/docs/en/babel-cli), they mostly focus on transpiling rather than keeping source level quality. Also they lack support for handling custom extensions like `.vue` and copying assets.

## 🚀 Usage

```bash
npx mkdist [rootDir] [--src=src] [--dist=dist] [--no-clean] [--pattern=glob [--pattern=more-glob]] [--format=cjs|esm] [-d|--declaration] [--ext=mjs|js|ts]
```

## License

[MIT](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://npmx.dev/api/registry/badge/version/mkdist
[npm-version-href]: https://npmx.dev/package/mkdist
[npm-downloads-src]: https://npmx.dev/api/registry/badge/downloads/mkdist
[npm-downloads-href]: https://npmx.dev/package/mkdist
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/unjs/mkdist/ci.yml?branch=main&style=flat-square
[github-actions-href]: https://github.com/unjs/mkdist/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/mkdist/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/mkdist
