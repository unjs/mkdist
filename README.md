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

## ❓ Why?

Bundling libraries isn't always the best choice:

- We lose original file structure
- We lose modern syntax by transpiling in bundle
- We lose critical-css by extracting css to a global dist (vue)
- Dependencies will be always imported from bundle even if not used (a second bundling step might fix this but it usually won't happen in development and for dependencies with side-effects)

While there are tools like [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) and [@babel/cli](https://babeljs.io/docs/en/babel-cli), they mostly focus on transpiling rather than keeping source level quality. Also they lack support for handling custom extensions like `.vue` and copying assets.

## 🚀 Usage

```bash
npx mkdist [rootDir] [--src=src] [--dist=dist] [--pattern=glob [--pattern=more-glob]] [--format=cjs|esm] [-d|--declaration] [--ext=mjs|js|ts]
```

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/mkdist?style=flat-square
[npm-version-href]: https://npmjs.com/package/mkdist

[npm-downloads-src]: https://img.shields.io/npm/dm/mkdist?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/mkdist

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/mkdist/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/mkdist/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/mkdist/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/mkdist
