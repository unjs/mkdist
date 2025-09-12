# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v2.4.1

[compare changes](https://github.com/unjs/mkdist/compare/v2.4.0...v2.4.1)

### 🩹 Fixes

- Consider extension when deduping outputs ([f4424fe](https://github.com/unjs/mkdist/commit/f4424fe))

### ❤️ Contributors

- Daniel Roe ([@danielroe](https://github.com/danielroe))

## v2.4.0

[compare changes](https://github.com/unjs/mkdist/compare/v2.3.0...v2.4.0)

### 🚀 Enhancements

- **dts:** Emit `.d.vue.ts` as type declaration of `.vue` files ([#301](https://github.com/unjs/mkdist/pull/301))

### 🤖 CI

- Test against previous lts verison ([946852b](https://github.com/unjs/mkdist/commit/946852b))
- Remove install of corepack ([73894e6](https://github.com/unjs/mkdist/commit/73894e6))
- Bump setup/checkout action versions ([8a909da](https://github.com/unjs/mkdist/commit/8a909da))

### ❤️ Contributors

- Daniel Roe ([@danielroe](https://github.com/danielroe))
- Teages ([@Teages](https://github.com/Teages))

## v2.3.0

[compare changes](https://github.com/unjs/mkdist/compare/v2.2.0...v2.3.0)

### 🚀 Enhancements

- **vue:** Support adding relative extensions to dynamic imports ([#269](https://github.com/unjs/mkdist/pull/269))
- **vue:** Use `vue-sfc-transformer` if installed ([#300](https://github.com/unjs/mkdist/pull/300))

### 🩹 Fixes

- Use dynamic import `pkg-types` ([9d6065b](https://github.com/unjs/mkdist/commit/9d6065b))

### 🏡 Chore

- Update deps ([c3ff125](https://github.com/unjs/mkdist/commit/c3ff125))

### ✅ Tests

- Sort file list before snapshot ([152817d](https://github.com/unjs/mkdist/commit/152817d))

### 🤖 CI

- Force enable latest corepack ([587a5e4](https://github.com/unjs/mkdist/commit/587a5e4))

### ❤️ Contributors

- Teages ([@Teages](https://github.com/Teages))
- Pooya Parsa ([@pi0](https://github.com/pi0))
- Daniel Roe ([@danielroe](https://github.com/danielroe))
- Connor Pearson ([@cjpearson](https://github.com/cjpearson))

## v2.2.0

[compare changes](https://github.com/unjs/mkdist/compare/v2.1.0...v2.2.0)

### 🚀 Enhancements

- **dts:** Expose ts compiler errors ([#278](https://github.com/unjs/mkdist/pull/278))

### 🩹 Fixes

- Only add known ignore patterns by default ([#279](https://github.com/unjs/mkdist/pull/279))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v2.1.0

[compare changes](https://github.com/unjs/mkdist/compare/v2.0.1...v2.1.0)

### 🚀 Enhancements

- Support `globOptions` ([#266](https://github.com/unjs/mkdist/pull/266))

### 🩹 Fixes

- Convert absolute gitignore patterns to relative ([#265](https://github.com/unjs/mkdist/pull/265))

### 🏡 Chore

- Update deps ([d2aa83d](https://github.com/unjs/mkdist/commit/d2aa83d))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.0.1

[compare changes](https://github.com/unjs/mkdist/compare/v2.0.0...v2.0.1)

### 🩹 Fixes

- **vue:** Conditionally import `vue/compiler-sfc` ([c2f1a2e](https://github.com/unjs/mkdist/commit/c2f1a2e))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v2.0.0

[compare changes](https://github.com/unjs/mkdist/compare/v1.6.0...v2.0.0)

### 🚀 Enhancements

- **vue:** ⚠️  Refactor vue loader with vue/compiler-sfc ([#251](https://github.com/unjs/mkdist/pull/251))

### 🩹 Fixes

- Scan dotfiles in source paths ([#253](https://github.com/unjs/mkdist/pull/253))
- **cli:** Add `--no-clean` option ([#217](https://github.com/unjs/mkdist/pull/217))

### 🏡 Chore

- Dedupe lockfile ([15c1e70](https://github.com/unjs/mkdist/commit/15c1e70))

#### ⚠️ Breaking Changes

- **vue:** ⚠️  Refactor vue loader with vue/compiler-sfc ([#251](https://github.com/unjs/mkdist/pull/251))

### ❤️ Contributors

- ꤷꤵꤲꤱꛎ߀ⵤꚧ꓾ <metaory@gmail.com>
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Teages ([@Teages](http://github.com/Teages))

## v1.6.0

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.9...v1.6.0)

### 🚀 Enhancements

- Update esbuild to 0.24 ([d0dd1f7](https://github.com/unjs/mkdist/commit/d0dd1f7))

### 💅 Refactors

- **dts:** Improve  internal `extractDeclarations` readability ([#248](https://github.com/unjs/mkdist/pull/248))
- Replace fast-glob with tinyglobby ([#237](https://github.com/unjs/mkdist/pull/237))

### 🏡 Chore

- **release:** V1.5.9 ([9fdcf8a](https://github.com/unjs/mkdist/commit/9fdcf8a))
- Update dev dependencies ([39390b3](https://github.com/unjs/mkdist/commit/39390b3))
- Update eslint config ([10032ee](https://github.com/unjs/mkdist/commit/10032ee))

### ✅ Tests

- Add test for `components/index.ts` dts behavior ([eb495b0](https://github.com/unjs/mkdist/commit/eb495b0))

### ❤️ Contributors

- Superchupu ([@SuperchupuDev](http://github.com/SuperchupuDev))
- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.9

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.8...v1.5.9)

### 🩹 Fixes

- **dts:** Handle dir + file of same name ([#245](https://github.com/unjs/mkdist/pull/245))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.8

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.7...v1.5.8)

### 🩹 Fixes

- **dts:** Resolve directory exports in `.dts` files ([#244](https://github.com/unjs/mkdist/pull/244))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.7

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.6...v1.5.7)

### 🩹 Fixes

- **vue:** Skip transpilation with multiple script blocks ([#243](https://github.com/unjs/mkdist/pull/243))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.6

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.5...v1.5.6)

### 🩹 Fixes

- **dts:** Compatible with `vue-tsc` 2.0.x ([#242](https://github.com/unjs/mkdist/pull/242))

### ❤️ Contributors

- Teages ([@Teages](http://github.com/Teages))

## v1.5.5

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.4...v1.5.5)

### 🩹 Fixes

- **dts:** Update for compatibility with `vue-tsc` >=2.1 ([#240](https://github.com/unjs/mkdist/pull/240))

### ❤️ Contributors

- Teages ([@Teages](http://github.com/Teages))

## v1.5.4

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.3...v1.5.4)

### 💅 Refactors

- Replace `fs-extra` with `node:fs/promises` ([#231](https://github.com/unjs/mkdist/pull/231))
- Replace globby w/ fast-glob ([#230](https://github.com/unjs/mkdist/pull/230))

### 🏡 Chore

- Update deps ([3515d36](https://github.com/unjs/mkdist/commit/3515d36))
- Remove unused `mri` dependency ([d43b142](https://github.com/unjs/mkdist/commit/d43b142))
- Remove unused `globby` dependency` ([eb1f556](https://github.com/unjs/mkdist/commit/eb1f556))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sukka <isukkaw@gmail.com>

## v1.5.3

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.2...v1.5.3)

### 🩹 Fixes

- **dts:** Use `ts.convertCompilerOptionsFromJson` to normalise ([#224](https://github.com/unjs/mkdist/pull/224))

### 🏡 Chore

- Bump deps ([#225](https://github.com/unjs/mkdist/pull/225))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.2

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.1...v1.5.2)

### 🩹 Fixes

- Upgrade volar implementation ([#222](https://github.com/unjs/mkdist/pull/222))

### 🏡 Chore

- **release:** V1.5.1 ([b4c0a82](https://github.com/unjs/mkdist/commit/b4c0a82))
- Bump all dependencies ([#221](https://github.com/unjs/mkdist/pull/221))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.1

[compare changes](https://github.com/unjs/mkdist/compare/v1.5.0...v1.5.1)

### 🩹 Fixes

- Dynamically import `typescript` when normalising options ([b8afd50](https://github.com/unjs/mkdist/commit/b8afd50))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.5.0

[compare changes](https://github.com/unjs/mkdist/compare/v1.4.0...v1.5.0)

### 🚀 Enhancements

- Use `vue-tsc` generate vue declarations ([#154](https://github.com/unjs/mkdist/pull/154))
- Support vue-tsc v2 ([#201](https://github.com/unjs/mkdist/pull/201))
- Support custom typescript `compilerOptions` ([#215](https://github.com/unjs/mkdist/pull/215))

### 🩹 Fixes

- De-default `typescript` import ([c518477](https://github.com/unjs/mkdist/commit/c518477))
- Log errors emitting declarations ([1fb5a74](https://github.com/unjs/mkdist/commit/1fb5a74))

### 🏡 Chore

- **release:** V1.4.0 ([880ec30](https://github.com/unjs/mkdist/commit/880ec30))
- Update dependencies ([9137f70](https://github.com/unjs/mkdist/commit/9137f70))
- Update snapshots for vitest v1 ([ea2ff56](https://github.com/unjs/mkdist/commit/ea2ff56))

### 🎨 Styles

- Apply lint fixes ([365002a](https://github.com/unjs/mkdist/commit/365002a))

### 🤖 CI

- Test against node 18 ([aeb444f](https://github.com/unjs/mkdist/commit/aeb444f))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Zhong666 ([@aa900031](http://github.com/aa900031))
- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.4.0

[compare changes](https://github.com/unjs/mkdist/compare/v1.3.1...v1.4.0)

### 🚀 Enhancements

- Support postcss loader ([#167](https://github.com/unjs/mkdist/pull/167))

### 🩹 Fixes

- **cjs:** Hotfix babel transformation issue ([94444df](https://github.com/unjs/mkdist/commit/94444df))
- Resolve dynamic import paths ([#165](https://github.com/unjs/mkdist/pull/165))
- Pass all options to loader context ([ea5ba97](https://github.com/unjs/mkdist/commit/ea5ba97))

### 🌊 Types

- Add `cjs`, `mts` and `cts` to the supported extensions ([e7d3ffb](https://github.com/unjs/mkdist/commit/e7d3ffb))

### 🏡 Chore

- **release:** V1.3.1 ([cf0415f](https://github.com/unjs/mkdist/commit/cf0415f))
- Update lockfile ([f773e2b](https://github.com/unjs/mkdist/commit/f773e2b))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Liuyang0826 ([@liuyang0826](http://github.com/liuyang0826))

## v1.3.1

[compare changes](https://github.com/unjs/mkdist/compare/v1.3.0...v1.3.1)

### 🩹 Fixes

- **cjs:** Hotfix babel transformation issue ([94444df](https://github.com/unjs/mkdist/commit/94444df))

### 🏡 Chore

- Format with prettier v3 ([86fd8cb](https://github.com/unjs/mkdist/commit/86fd8cb))
- Update dependencies ([6078463](https://github.com/unjs/mkdist/commit/6078463))

### 🤖 CI

- Use conventional commit for autofix ([2e20d10](https://github.com/unjs/mkdist/commit/2e20d10))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v1.3.0

[compare changes](https://github.com/unjs/mkdist/compare/v1.2.0...v1.3.0)

### 🚀 Enhancements

- Allow passing esbuild transform options ([#144](https://github.com/unjs/mkdist/pull/144))
- Support `jsx` and `tsx` files ([#71](https://github.com/unjs/mkdist/pull/71))
- Support configurable loaders ([#152](https://github.com/unjs/mkdist/pull/152))
- **cli:** Support `--minify` and `--target` ([84c59aa](https://github.com/unjs/mkdist/commit/84c59aa))

### 🩹 Fixes

- Handle `.cts` and `.mts` as typescript ([#162](https://github.com/unjs/mkdist/pull/162))

### 💅 Refactors

- **cli:** Migrate to unjs/citty ([#157](https://github.com/unjs/mkdist/pull/157))

### 🏡 Chore

- **release:** V1.2.0 ([7a5f92e](https://github.com/unjs/mkdist/commit/7a5f92e))
- Update ci badge in readme ([#146](https://github.com/unjs/mkdist/pull/146))
- Add compiler options type ([2289288](https://github.com/unjs/mkdist/commit/2289288))
- Add `lint:fix` script ([32915a9](https://github.com/unjs/mkdist/commit/32915a9))
- Update dependencies ([2561704](https://github.com/unjs/mkdist/commit/2561704))
- Add autofix ci ([7ad18dc](https://github.com/unjs/mkdist/commit/7ad18dc))
- Remove extra console log ([76bb4f7](https://github.com/unjs/mkdist/commit/76bb4f7))
- Remove todo ([0296ca6](https://github.com/unjs/mkdist/commit/0296ca6))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Vadym <vadym.karpus@gmail.com>
- Liuyang0826 ([@liuyang0826](http://github.com/liuyang0826))
- Uuau99999 ([@uuau99999](http://github.com/uuau99999))
- Zuixinwang 
- Daniel Roe <daniel@roe.dev>
- Trim21 ([@trim21](http://github.com/trim21))

## v1.2.0

[compare changes](https://github.com/unjs/mkdist/compare/v1.1.2...v1.2.0)


### 🚀 Enhancements

  - Add support for relativising type exports ([#135](https://github.com/unjs/mkdist/pull/135))
  - Add support for relativising type exports ([#140](https://github.com/unjs/mkdist/pull/140))

### 🏡 Chore

  - **release:** V1.1.2 ([4892929](https://github.com/unjs/mkdist/commit/4892929))

### ❤️  Contributors

- Daniel Roe <daniel@roe.dev>
- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.1.2

[compare changes](https://github.com/unjs/mkdist/compare/v1.1.1...v1.1.2)


### 🩹 Fixes

  - Add `.js` extension for relative import and exports in declarations ([#134](https://github.com/unjs/mkdist/pull/134))

### ❤️  Contributors

- Daniel Roe <daniel@roe.dev>

## v1.1.1

[compare changes](https://github.com/unjs/mkdist/compare/v1.1.0...v1.1.1)


### 🩹 Fixes

  - Add support for multi-line import extension normalization ([#120](https://github.com/unjs/mkdist/pull/120))

### 🏡 Chore

  - Update release script ([2803fe1](https://github.com/unjs/mkdist/commit/2803fe1))

### ❤️  Contributors

- Pooya Parsa <pooya@pi0.io>
- Alex Grozav <alex@grozav.com>

## [1.1.0](https://github.com/unjs/mkdist/compare/v1.0.0...v1.1.0) (2023-01-10)


### Features

* improve sass compilation ([#109](https://github.com/unjs/mkdist/issues/109)) ([bc9536a](https://github.com/unjs/mkdist/commit/bc9536a2cb444b131497d3263131f7cf99486a12))


### Bug Fixes

* ensure sass output file has css extension ([#111](https://github.com/unjs/mkdist/issues/111)) ([ea0c57c](https://github.com/unjs/mkdist/commit/ea0c57ca7a082d144fad6fd837f731afeacca5c9))

## [1.0.0](https://github.com/unjs/mkdist/compare/v0.4.1...v1.0.0) (2022-11-15)

### [0.4.1](https://github.com/unjs/mkdist/compare/v0.4.0...v0.4.1) (2022-11-15)

## [0.4.0](https://github.com/unjs/mkdist/compare/v0.3.13...v0.4.0) (2022-10-27)


### ⚠ BREAKING CHANGES

* upgrade globby

### Features

* support multiple glob patterns ([#41](https://github.com/unjs/mkdist/issues/41)) ([b339163](https://github.com/unjs/mkdist/commit/b3391633adc16a524787b24963110da76c3293c7))
* **vue:** support transpilation of `<style>` blocks with `sass` ([#27](https://github.com/unjs/mkdist/issues/27)) ([36e5b4f](https://github.com/unjs/mkdist/commit/36e5b4f6e76fd1f46a0758480bb83a7bba55a705))


### Bug Fixes

* add `strictNullChecks` ([#68](https://github.com/unjs/mkdist/issues/68)) ([12709f6](https://github.com/unjs/mkdist/commit/12709f65eb152b36eb7659ee27adb9bbf91d6b13))


* upgrade globby ([8f3a513](https://github.com/unjs/mkdist/commit/8f3a51352f2947481236b8f2735f511a3f088bf0))

### [0.3.13](https://github.com/unjs/mkdist/compare/v0.3.12...v0.3.13) (2022-06-23)


### Bug Fixes

* **dts:** introp default for typescript import ([5578a7c](https://github.com/unjs/mkdist/commit/5578a7c99997a2119fc64227a51a9c238d40189f))

### [0.3.12](https://github.com/unjs/mkdist/compare/v0.3.11...v0.3.12) (2022-06-23)

### [0.3.11](https://github.com/unjs/mkdist/compare/v0.3.10...v0.3.11) (2022-06-23)


### Features

* resolve full path to cjs cunks ([df2a548](https://github.com/unjs/mkdist/commit/df2a548cd2d1a7b5f173817ae634fa3f6d5d884b))


### Bug Fixes

* downgrade pathe to 0.2.x ([659f7e9](https://github.com/unjs/mkdist/commit/659f7e97b0fdc4d0187deade839705597287a895))

### [0.3.10](https://github.com/unjs/mkdist/compare/v0.3.9...v0.3.10) (2022-02-04)


### Bug Fixes

* support emitting `.d.mts` for `.mjs` files ([#26](https://github.com/unjs/mkdist/issues/26)) ([3f21784](https://github.com/unjs/mkdist/commit/3f21784714797348cc091abbf4e6a13503242440))

### [0.3.9](https://github.com/unjs/mkdist/compare/v0.3.8...v0.3.9) (2022-01-21)


### Features

* support filtering input files ([#21](https://github.com/unjs/mkdist/issues/21)) ([caa5401](https://github.com/unjs/mkdist/commit/caa54014df78310cd52a233c5ca8b2782ed2f5ac))

### [0.3.8](https://github.com/unjs/mkdist/compare/v0.3.7...v0.3.8) (2021-12-14)


### Bug Fixes

* revert [#17](https://github.com/unjs/mkdist/issues/17), [#19](https://github.com/unjs/mkdist/issues/19) ([8e346d0](https://github.com/unjs/mkdist/commit/8e346d014b7db24ec2f60e7f995cb1e07fc36f56))

### [0.3.7](https://github.com/unjs/mkdist/compare/v0.3.6...v0.3.7) (2021-12-13)


### Bug Fixes

* multiline regex for exports ([#19](https://github.com/unjs/mkdist/issues/19)) ([d877ddb](https://github.com/unjs/mkdist/commit/d877ddbbf30fb5e986054c33c41102099068b486))

### [0.3.6](https://github.com/unjs/mkdist/compare/v0.3.5...v0.3.6) (2021-12-10)


### Bug Fixes

* multiline regex to replace import extensions ([#17](https://github.com/unjs/mkdist/issues/17)) ([7a2690c](https://github.com/unjs/mkdist/commit/7a2690cab3b3ede4bfb1d40817a89ac4c9ea620f))
* **vue:** skip transforming for `<script setup>` ([#15](https://github.com/unjs/mkdist/issues/15)) ([93cb489](https://github.com/unjs/mkdist/commit/93cb48970fb5f8a708866dbcf2b021f87773bbac)), closes [#14](https://github.com/unjs/mkdist/issues/14)

### [0.3.5](https://github.com/unjs/mkdist/compare/v0.3.4...v0.3.5) (2021-10-20)


### Bug Fixes

* **pkg:** remove `vue-template-compiler` as dep ([#13](https://github.com/unjs/mkdist/issues/13)) ([8094c43](https://github.com/unjs/mkdist/commit/8094c43e553eeb11a4ada83d035a7c11cf27691d))

### [0.3.4](https://github.com/unjs/mkdist/compare/v0.3.3...v0.3.4) (2021-10-13)


### Bug Fixes

* handle script tags with attributes ([#12](https://github.com/unjs/mkdist/issues/12)) ([19f9d5d](https://github.com/unjs/mkdist/commit/19f9d5d9987d72f29c7362a94f59990768903358))

### [0.3.3](https://github.com/unjs/mkdist/compare/v0.3.2...v0.3.3) (2021-07-15)


### Bug Fixes

* avoid overriding files with original extension (resolves [#11](https://github.com/unjs/mkdist/issues/11)) ([bb59350](https://github.com/unjs/mkdist/commit/bb59350ab865b2a02cd6c6da8ea4a4985de06773))

### [0.3.2](https://github.com/unjs/mkdist/compare/v0.3.1...v0.3.2) (2021-06-16)

### [0.3.1](https://github.com/unjs/mkdist/compare/v0.3.0...v0.3.1) (2021-05-24)


### Bug Fixes

* use default export with cjs transform ([68e1ed1](https://github.com/unjs/mkdist/commit/68e1ed13d217983be2560eba399161e05f283106))

## [0.3.0](https://github.com/unjs/mkdist/compare/v0.2.1...v0.3.0) (2021-05-24)


### ⚠ BREAKING CHANGES

* resolve relative imports for mjs files (resolves #7)

### Features

* resolve relative imports for mjs files (resolves [#7](https://github.com/unjs/mkdist/issues/7)) ([86b6175](https://github.com/unjs/mkdist/commit/86b6175fd1a2a16fde27f2dff0c62898e4d0a853))

### [0.2.1](https://github.com/unjs/mkdist/compare/v0.2.0...v0.2.1) (2021-04-23)


### Features

* ext option ([f2c1bc6](https://github.com/unjs/mkdist/commit/f2c1bc62ee10922b36d2750dd79d34c748477c09))

## [0.2.0](https://github.com/unjs/mkdist/compare/v0.1.7...v0.2.0) (2021-04-21)


### ⚠ BREAKING CHANGES

* emit `.mjs` files whn format is mjs

### Features

* emit `.mjs` files whn format is mjs ([ec5fcc4](https://github.com/unjs/mkdist/commit/ec5fcc478c4bab95b89a70645a90e518327b845a))

### [0.1.7](https://github.com/unjs/mkdist/compare/v0.1.6...v0.1.7) (2021-04-14)

### [0.1.6](https://github.com/unjs/mkdist/compare/v0.1.5...v0.1.6) (2021-04-09)


### Bug Fixes

* update esbuild to use transform directly ([9b56d1c](https://github.com/unjs/mkdist/commit/9b56d1c8ccdae5562826ab8ae00a9fcc3649ccb2))

### [0.1.5](https://github.com/unjs/mkdist/compare/v0.1.4...v0.1.5) (2021-04-08)


### Features

* generate declaration files ([#4](https://github.com/unjs/mkdist/issues/4)) ([4b54426](https://github.com/unjs/mkdist/commit/4b5442606f6c0f066625252700485afaa4c05a75))

### [0.1.4](https://github.com/unjs/mkdist/compare/v0.1.3...v0.1.4) (2021-04-07)


### Features

* support cleanDist option ([f613c17](https://github.com/unjs/mkdist/commit/f613c17b6a15c749c58ca395ef1358ff008311e3))

### [0.1.3](https://github.com/unjs/mkdist/compare/v0.1.2...v0.1.3) (2021-03-30)


### Bug Fixes

* unlink before cleaning up dist dir ([c8cb2b8](https://github.com/unjs/mkdist/commit/c8cb2b8a30e7ada0ad2d7383bdb8e9efdb57120e))

### [0.1.2](https://github.com/unjs/mkdist/compare/v0.1.1...v0.1.2) (2021-03-06)

### [0.1.1](https://github.com/unjs/mkdist/compare/v0.1.0...v0.1.1) (2021-01-17)


### Bug Fixes

* **pkg:** use siroc build ([ec85042](https://github.com/unjs/mkdist/commit/ec85042c544d7dad09dbf13517dfa47f9feb04e2))

## [0.1.0](https://github.com/unjs/mkdist/compare/v0.0.5...v0.1.0) (2021-01-17)


### Bug Fixes

* fix binary name ([95e1695](https://github.com/unjs/mkdist/commit/95e1695861b4495b7025800112d8eb6b574c1ed2))

### [0.0.5](https://github.com/unjs/mkdist/compare/v0.0.4...v0.0.5) (2021-01-15)


### Bug Fixes

* bypass `.d.ts` files ([142f0ce](https://github.com/unjs/mkdist/commit/142f0cea4f9a6f6cb90339e2bcc07197535f3ac4))

### [0.0.4](https://github.com/unjs/mkdist/compare/v0.0.3...v0.0.4) (2021-01-15)


### Bug Fixes

* use proper bin ([e763270](https://github.com/unjs/mkdist/commit/e763270155b006ce5d42522cd5172170b6c135a9))

### [0.0.3](https://github.com/unjs/mkdist/compare/v0.0.2...v0.0.3) (2021-01-14)

### [0.0.2](https://github.com/unjs/mkdist/compare/v0.0.1...v0.0.2) (2021-01-14)


### Features

* support format option ([c70f54e](https://github.com/unjs/mkdist/commit/c70f54e32769d45485096e334ed88ab0ba709209))
* **cli:** support src, dist and help arguments ([5f3606d](https://github.com/unjs/mkdist/commit/5f3606d33b490ba3558148691d367d6caad9aa89))

### 0.0.1 (2021-01-14)
