# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
