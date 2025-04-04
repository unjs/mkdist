import { readFile } from "node:fs/promises";
import { relative, resolve } from "pathe";
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import { createLoader } from "../src/loader";
import { afterEach } from "vitest";

describe("mkdist", () => {
  let mkdist: typeof import("../src/make").mkdist;

  beforeAll(async () => {
    mkdist = (await import("../src/make")).mkdist;
  });

  it("mkdist", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { writtenFiles } = await mkdist({ rootDir });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/bar.mjs",
        "dist/demo.css",
        "dist/dir-export.mjs",
        "dist/foo.mjs",
        "dist/foo.d.ts", // manual
        "dist/index.mjs",
        "dist/types.d.ts",
        "dist/star/index.mjs",
        "dist/star/other.mjs",
        "dist/components/index.mjs",
        "dist/components/blank.vue",
        "dist/components/define-model.vue",
        "dist/components/emit-and-with-default.vue",
        "dist/components/js.vue",
        "dist/components/script-multi-block.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/bar/index.mjs",
        "dist/bar/esm.mjs",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/nested.css",
        "dist/prop-types/index.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );
  });

  it("mkdist (custom glob pattern)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { writtenFiles } = await mkdist({
      rootDir,
      pattern: "components/**",
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/components/index.mjs",
        "dist/components/blank.vue",
        "dist/components/define-model.vue",
        "dist/components/emit-and-with-default.vue",
        "dist/components/js.vue",
        "dist/components/script-multi-block.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );
  });

  it("mkdist (multiple glob patterns)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { writtenFiles } = await mkdist({
      rootDir,
      pattern: ["components/**", "!components/js.vue"],
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/components/index.mjs",
        "dist/components/blank.vue",
        "dist/components/define-model.vue",
        "dist/components/emit-and-with-default.vue",
        "dist/components/script-multi-block.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );
  });

  it("mkdist (emit types)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { writtenFiles } = await mkdist({
      rootDir,
      declaration: true,
      addRelativeDeclarationExtensions: true,
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/bar.d.ts",
        "dist/bar.mjs",
        "dist/demo.css",
        "dist/dir-export.d.ts",
        "dist/dir-export.mjs",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/star/index.mjs",
        "dist/star/index.d.ts",
        "dist/star/other.mjs",
        "dist/star/other.d.ts",
        "dist/types.d.ts",
        "dist/components/index.mjs",
        "dist/components/index.d.ts",
        "dist/components/blank.vue",
        "dist/components/blank.vue.d.ts",
        "dist/components/define-model.vue",
        "dist/components/define-model.vue.d.ts",
        "dist/components/emit-and-with-default.vue",
        "dist/components/emit-and-with-default.vue.d.ts",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-multi-block.vue",
        "dist/components/script-multi-block.vue.d.ts",
        "dist/components/script-setup-ts.vue",
        "dist/components/script-setup-ts.vue.d.ts",
        "dist/components/ts.vue",
        "dist/components/ts.vue.d.ts",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/components/jsx.d.ts",
        "dist/components/tsx.d.ts",
        "dist/bar/index.mjs",
        "dist/bar/index.d.ts",
        "dist/bar/esm.mjs",
        "dist/bar/esm.d.mts",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/ts/test1.d.mts",
        "dist/ts/test2.d.cts",
        "dist/nested.css",
        "dist/prop-types/index.mjs",
        "dist/prop-types/index.d.ts",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );

    expect(await readFile(resolve(rootDir, "dist/foo.d.ts"), "utf8")).toMatch(
      "manual declaration",
    );

    expect(await readFile(resolve(rootDir, "dist/star/index.d.ts"), "utf8"))
      .toMatchInlineSnapshot(`
        "export * from "./other.js";
        export type { Other } from "./other.js";
        export declare function wonder(twinkle: import("./other.js").Other): string;
        "
      `);

    expect(await readFile(resolve(rootDir, "dist/dir-export.d.ts"), "utf8"))
      .toMatchInlineSnapshot(`
        "export { default as bar } from "./bar.js";
        export * from "./star/index.js";
        "
      `);

    expect(
      await readFile(resolve(rootDir, "dist/bar/esm.d.mts"), "utf8"),
    ).toMatch("declare");

    expect(
      await readFile(resolve(rootDir, "dist/components/index.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
      "export * as jsx from "./jsx.jsx.js";
      export * as tsx from "./tsx.tsx.js";
      export * as blank from "./blank.vue.js";
      export * as scriptSetupTS from "./script-setup-ts.vue.js";
      export * as scriptMultiBlock from "./script-multi-block.vue.js";
      export * as ts from "./ts.vue.js";
      "
    `);

    expect(
      await readFile(resolve(rootDir, "dist/components/ts.vue.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
      "declare const _default: import("vue").DefineComponent<{}, {}, {
          test: string;
          str: "test";
      }, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/blank.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "declare const _default: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-multi-block.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "interface MyComponentProps {
          msg: string;
      }
      declare const _default: import("vue").DefineComponent<MyComponentProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<MyComponentProps> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-setup-ts.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "import { Color } from "#prop-types";
      type __VLS_Props = {
          msg: string;
          color: Color;
      };
      declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
      export default _default;
      "
    `);
  }, 50_000);

  describe("mkdist (sass compilation)", () => {
    const rootDir = resolve(__dirname, "fixture");
    let writtenFiles: string[];
    beforeEach(async () => {
      const results = await mkdist({ rootDir });
      writtenFiles = results.writtenFiles;
    });

    it("resolves local imports and excludes partials ", async () => {
      const css = await readFile(resolve(rootDir, "dist/demo.css"), "utf8");

      expect(writtenFiles).not.toContain("dist/_base.css");
      expect(css).toMatch("color: green");
    });

    it("resolves node_modules imports", async () => {
      const css = await readFile(resolve(rootDir, "dist/demo.css"), "utf8");
      expect(css).toMatch("box-sizing: border-box;");
    });

    it("compiles sass blocks in vue SFC", async () => {
      const vue = await readFile(
        resolve(rootDir, "dist/components/js.vue"),
        "utf8",
      );

      expect(vue).toMatch("color: green;\n  background-color: red;");
    });
  });

  it("mkdist (only jsLoader and vueLoader)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { writtenFiles } = await mkdist({
      rootDir,
      loaders: ["js", "vue"],
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/bar.mjs",
        "dist/demo.scss",
        "dist/_base.scss",
        "dist/dir-export.mjs",
        "dist/foo.mjs",
        "dist/foo.d.ts", // manual
        "dist/index.mjs",
        "dist/types.d.ts",
        "dist/star/index.mjs",
        "dist/star/other.mjs",
        "dist/components/index.mjs",
        "dist/components/blank.vue",
        "dist/components/define-model.vue",
        "dist/components/emit-and-with-default.vue",
        "dist/components/js.vue",
        "dist/components/script-multi-block.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/bar/index.mjs",
        "dist/bar/esm.mjs",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/nested.css",
        "dist/prop-types/index.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-setup-ts.vue"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "<template>
        <div>{{ str }}</div>
      </template>

      <script setup>
      import { ref } from "vue";
      const props = defineProps({
        msg: {
          type: String,
          required: true
        },
        color: {
          type: Object,
          required: true
        }
      });
      const str = ref("hello");
      </script>
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-multi-block.vue"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "<template>
        <div>{{ msg }}</div>
      </template>

      <script>

      </script>

      <script setup>
      defineProps({
        msg: {
          type: String,
          required: true
        }
      });
      </script>
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/emit-and-with-default.vue"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "<script setup>
      const props = defineProps({
        buttonText: {
          type: String,
          required: false,
          default: "Click"
        }
      });
      const emit = defineEmits(["clickBtn"]);
      </script>

      <template>
        <div>
          <button @click="emit('clickBtn')">{{ buttonText }}</button>
        </div>
      </template>
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/define-model.vue"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "<script setup>
      const model = defineModel({
        "type": String,
        ...{
          required: true
        }
      });
      const twoType = defineModel("twoType", {
        "type": [String, Number],
        ...{
          required: true
        }
      });
      const runtimeOnly = defineModel("runtimeOnly", {
        type: String,
        required: true
      });
      const nameOnly = defineModel("nameOnly");
      const empty = defineModel();
      const { disabled } = defineProps({
        disabled: {
          type: Boolean,
          required: false
        }
      });
      const emit = defineEmits(["submit"]);
      </script>

      <template>
        <div>
          <input v-model="model" :disabled />
          <button @click="emit('submit', model)">Submit</button>
        </div>
      </template>
      "
    `);
  });

  describe("createLoader", () => {
    it("loadFile returns undefined for an unsupported file", async () => {
      const { loadFile } = createLoader();
      const results = await loadFile({
        extension: ".noth",
        getContents: () => new Error("this should not be called") as any,
        path: "another.noth",
      });
      expect(results).toMatchObject([{ raw: true }]);
    });

    it("vueLoader handles no transpilation of script tag", async () => {
      const { loadFile } = createLoader({
        loaders: ["vue"],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () => "<script>Test</script>",
        path: "test.vue",
      });
      expect(results).toMatchObject([{ raw: true }]);
    });

    it("vueLoader handles script tags with attributes", async () => {
      const { loadFile } = createLoader({
        loaders: ["vue", "js"],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () => '<script foo lang="ts">Test</script>',
        path: "test.vue",
      });
      expect(results).toMatchObject([
        { contents: ["<script foo>", "Test;", "</script>", ""].join("\n") },
      ]);
    });

    it("vueLoader handles style tags", async () => {
      const { loadFile } = createLoader({
        loaders: ["vue", "sass"],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () =>
          [
            "<script>export default {}</script>",
            '<style scoped lang="scss">$color: red; :root { background-color: $color }</style>',
          ].join("\n"),
        path: "test.vue",
      });
      expect(results).toMatchObject([
        {
          contents: [
            "<script>",
            "export default {}",
            "</script>",
            "",
            "<style scoped>",
            ":root {",
            "  background-color: red;",
            "}",
            "</style>",
            "",
          ].join("\n"),
        },
      ]);
    });

    it("vueLoader will generate dts file", async () => {
      const { loadFile } = createLoader({
        loaders: ["vue", "js"],
        declaration: true,
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () =>
          '<script lang="ts">export default bob = 42 as const</script>',
        path: "test.vue",
      });
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ declaration: true }),
        ]),
      );
    });

    it("jsLoader will generate dts file (.js)", async () => {
      const { loadFile } = createLoader({
        loaders: ["js"],
        declaration: true,
      });
      const results = await loadFile({
        extension: ".js",
        getContents: () => "export default bob = 42",
        path: "test.mjs",
      });
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ declaration: true }),
        ]),
      );
    });

    it("jsLoader will generate dts file (.ts)", async () => {
      const { loadFile } = createLoader({
        loaders: ["js"],
        declaration: true,
      });
      const results = await loadFile({
        extension: ".ts",
        getContents: () => "export default bob = 42 as const",
        path: "test.ts",
      });
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ declaration: true }),
        ]),
      );
    });

    it("jsLoader: respect esbuild options", async () => {
      const { loadFile } = createLoader({
        loaders: ["js"],
        declaration: true,
        esbuild: {
          keepNames: true,
        },
      });
      const results =
        (await loadFile({
          extension: ".ts",
          getContents: () => "function testFunctionName() {}",
          path: "test.ts",
        })) || [];
      expect(results[1].contents).includes("Object.defineProperty");
    });
  });

  it("jsLoader: Support JSX", async () => {
    const { loadFile } = createLoader({
      loaders: ["js"],
      declaration: true,
    });
    const results =
      (await loadFile({
        extension: ".jsx",
        getContents: () => "export const Test = () => <div>42</div>",
        path: "test.jsx",
      })) || [];
    expect(results[1].contents).toMatchInlineSnapshot(`
      "export const Test = () => /* @__PURE__ */ React.createElement("div", null, "42");
      "
    `);
  });

  it("jsLoader: Support TSX", async () => {
    const { loadFile } = createLoader({
      loaders: ["js"],
      declaration: true,
    });
    const results =
      (await loadFile({
        extension: ".tsx",
        getContents: () => "export const Test = () => <div>42</div>",
        path: "test.tsx",
      })) || [];
    expect(results[1].contents).toMatchInlineSnapshot(`
      "export const Test = () => /* @__PURE__ */ React.createElement("div", null, "42");
      "
    `);
  });

  it("emits DTS errors", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { mkdist } = await import("../src/make");
    const { errors } = await mkdist({
      rootDir,
      declaration: true,
      typescript: {
        compilerOptions: {
          // force compiler errors to be emitted
          noEmitOnError: true,
        },
      },
    });
    const files = errors.map((e) => relative(rootDir, e.filename));
    expect(files.sort()).toMatchInlineSnapshot(`
      [
        "dist/components/index.d.ts",
        "dist/components/tsx.d.ts",
      ]
    `);
  }, 50_000);
});

describe("mkdist with fallback vue loader", () => {
  const consoleWarnSpy = vi.spyOn(console, "warn");
  beforeAll(() => {
    vi.resetModules();
    vi.doMock("vue-sfc-transformer/mkdist", async () => {
      throw new Error("vue-sfc-transformer is not installed");
    });
  });

  afterAll(() => {
    vi.doUnmock("vue-sfc-transformer/mkdist");
  });

  afterEach(() => {
    consoleWarnSpy.mockReset();
  });

  it("keep the template and script block", async () => {
    expect(await fixture(`<script lang="ts">const a: number = 1</script>`))
      .toMatchInlineSnapshot(`
      "<script lang="ts">const a: number = 1</script>"
    `);

    expect(
      await fixture(`<script setup lang="ts">const a: number = 1</script>`),
    ).toMatchInlineSnapshot(
      `"<script setup lang="ts">const a: number = 1</script>"`,
    );

    expect(
      await fixture(
        [
          `<script setup lang="ts">const a: number | null = 1</script>`,
          `<template><div>{{ a!.toFixed(2) }}</div></template>`,
        ].join("\n"),
      ),
    ).toMatchInlineSnapshot(`
        "<script setup lang="ts">const a: number | null = 1</script>
        <template><div>{{ a!.toFixed(2) }}</div></template>"
      `);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[mkdist] vue-sfc-transformer is not installed, mkdist will not transforme typescript syntax in the Vue SFC",
    );
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it("transform style block", async () => {
    expect(
      await fixture(
        [
          `<script setup lang="ts">const a: number | null = 1</script>`,
          `<style>a { color: red }</style>`,
        ].join("\n"),
      ),
    ).toMatchInlineSnapshot(`
        "<script setup lang="ts">const a: number | null = 1</script>
        <style>a { color: red }</style>"
      `);

    expect(
      await fixture(
        [
          `<script setup lang="ts">const a: number | null = 1</script>`,
          `<style lang="scss">.a { .b { color: red } }</style>`,
        ].join("\n"),
      ),
    ).toMatchInlineSnapshot(`
        "<script setup lang="ts">
        const a: number | null = 1
        </script>

        <style>
        .a .b {
          color: red;
        }
        </style>
        "
      `);
  });

  async function fixture(input: string) {
    const { loadFile } = createLoader({
      loaders: ["vue", "js", "sass"],
    });
    const results = await loadFile({
      extension: ".vue",
      getContents: () => input,
      path: "test.vue",
    });
    return results?.[0].contents || input;
  }
});

describe("mkdist with vue-tsc v1", () => {
  beforeAll(() => {
    vi.resetModules();

    vi.doMock("pkg-types", async (importOriginal) => {
      const original = await importOriginal<typeof import("pkg-types")>();
      return {
        ...original,
        readPackageJSON: (path: string) => {
          if (path === "vue-tsc") {
            return original.readPackageJSON("vue-tsc1");
          }
          return original.readPackageJSON(path);
        },
      };
    });
    vi.doMock("vue-tsc", async () => {
      return await import("vue-tsc1");
    });
  });

  afterAll(() => {
    vi.doUnmock("pkg-types");
    vi.doUnmock("vue-tsc");
  });

  it("mkdist (emit types)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { mkdist } = await import("../src/make");

    const { writtenFiles } = await mkdist({
      rootDir,
      declaration: true,
      addRelativeDeclarationExtensions: true,
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/bar.d.ts",
        "dist/bar.mjs",
        "dist/demo.css",
        "dist/dir-export.d.ts",
        "dist/dir-export.mjs",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/star/index.mjs",
        "dist/star/index.d.ts",
        "dist/star/other.mjs",
        "dist/star/other.d.ts",
        "dist/types.d.ts",
        "dist/components/index.mjs",
        "dist/components/index.d.ts",
        "dist/components/blank.vue",
        "dist/components/blank.vue.d.ts",
        "dist/components/define-model.vue",
        "dist/components/define-model.vue.d.ts",
        "dist/components/emit-and-with-default.vue",
        "dist/components/emit-and-with-default.vue.d.ts",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-multi-block.vue",
        "dist/components/script-multi-block.vue.d.ts",
        "dist/components/script-setup-ts.vue",
        "dist/components/script-setup-ts.vue.d.ts",
        "dist/components/ts.vue",
        "dist/components/ts.vue.d.ts",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/components/jsx.d.ts",
        "dist/components/tsx.d.ts",
        "dist/bar/index.mjs",
        "dist/bar/index.d.ts",
        "dist/bar/esm.mjs",
        "dist/bar/esm.d.mts",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/ts/test1.d.mts",
        "dist/ts/test2.d.cts",
        "dist/nested.css",
        "dist/prop-types/index.mjs",
        "dist/prop-types/index.d.ts",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );

    expect(await readFile(resolve(rootDir, "dist/foo.d.ts"), "utf8")).toMatch(
      "manual declaration",
    );

    expect(await readFile(resolve(rootDir, "dist/star/index.d.ts"), "utf8"))
      .toMatchInlineSnapshot(`
        "export * from "./other.js";
        export type { Other } from "./other.js";
        export declare function wonder(twinkle: import("./other.js").Other): string;
        "
      `);
    expect(
      await readFile(resolve(rootDir, "dist/bar/esm.d.mts"), "utf8"),
    ).toMatch("declare");

    expect(
      await readFile(resolve(rootDir, "dist/components/index.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
      "export * as jsx from "./jsx.jsx.js";
      export * as tsx from "./tsx.tsx.js";
      export * as blank from "./blank.vue.js";
      export * as scriptSetupTS from "./script-setup-ts.vue.js";
      export * as scriptMultiBlock from "./script-multi-block.vue.js";
      export * as ts from "./ts.vue.js";
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/blank.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "declare const _default: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(resolve(rootDir, "dist/components/ts.vue.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
      "declare const _default: import("vue").DefineComponent<{}, {}, {
          test: string;
          str: "test";
      }, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-multi-block.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "interface MyComponentProps {
          msg: string;
      }
      declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<__VLS_TypePropsToRuntimeProps<MyComponentProps>>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_TypePropsToRuntimeProps<MyComponentProps>>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
      type __VLS_TypePropsToRuntimeProps<T> = {
          [K in keyof T]-?: {} extends Pick<T, K> ? {
              type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
          } : {
              type: import('vue').PropType<T[K]>;
              required: true;
          };
      };
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-setup-ts.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "import { Color } from "#prop-types";
      declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{
          msg: string;
          color: Color;
      }>>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{
          msg: string;
          color: Color;
      }>>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
      type __VLS_TypePropsToRuntimeProps<T> = {
          [K in keyof T]-?: {} extends Pick<T, K> ? {
              type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
          } : {
              type: import('vue').PropType<T[K]>;
              required: true;
          };
      };
      "
    `);
  }, 50_000);
});

describe("mkdist with vue-tsc ~v2.0.21", () => {
  beforeAll(() => {
    vi.resetModules();

    vi.doMock("pkg-types", async (importOriginal) => {
      const original = await importOriginal<typeof import("pkg-types")>();
      return {
        ...original,
        readPackageJSON: async (path: string) => {
          if (path === "vue-tsc") {
            return original.readPackageJSON("vue-tsc2.0");
          }
          return original.readPackageJSON(path);
        },
      };
    });
    vi.doMock("mlly", async () => {
      const original = await import("mlly");
      const resolve: typeof import("mlly").resolve = (id, options) => {
        if (id === "vue-tsc") {
          return original.resolve("vue-tsc2.0", options);
        }
        return original.resolve(id, options);
      };
      return {
        ...original,
        resolve,
      };
    });
    vi.doMock("vue-tsc", async () => {
      return await import("vue-tsc2.0");
    });
  });

  afterAll(() => {
    vi.doUnmock("pkg-types");
    vi.doUnmock("vue-tsc");
  });

  it("mkdist (emit types)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { mkdist } = await import("../src/make");

    const { writtenFiles } = await mkdist({
      rootDir,
      declaration: true,
      addRelativeDeclarationExtensions: true,
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/bar.d.ts",
        "dist/bar.mjs",
        "dist/demo.css",
        "dist/dir-export.d.ts",
        "dist/dir-export.mjs",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/star/index.mjs",
        "dist/star/index.d.ts",
        "dist/star/other.mjs",
        "dist/star/other.d.ts",
        "dist/types.d.ts",
        "dist/components/index.mjs",
        "dist/components/index.d.ts",
        "dist/components/blank.vue",
        "dist/components/blank.vue.d.ts",
        "dist/components/define-model.vue",
        "dist/components/define-model.vue.d.ts",
        "dist/components/emit-and-with-default.vue",
        "dist/components/emit-and-with-default.vue.d.ts",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-multi-block.vue",
        "dist/components/script-multi-block.vue.d.ts",
        "dist/components/script-setup-ts.vue",
        "dist/components/script-setup-ts.vue.d.ts",
        "dist/components/ts.vue",
        "dist/components/ts.vue.d.ts",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/components/jsx.d.ts",
        "dist/components/tsx.d.ts",
        "dist/bar/index.mjs",
        "dist/bar/index.d.ts",
        "dist/bar/esm.mjs",
        "dist/bar/esm.d.mts",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/ts/test1.d.mts",
        "dist/ts/test2.d.cts",
        "dist/nested.css",
        "dist/prop-types/index.mjs",
        "dist/prop-types/index.d.ts",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );

    expect(await readFile(resolve(rootDir, "dist/foo.d.ts"), "utf8")).toMatch(
      "manual declaration",
    );

    expect(await readFile(resolve(rootDir, "dist/star/index.d.ts"), "utf8"))
      .toMatchInlineSnapshot(`
        "export * from "./other.js";
        export type { Other } from "./other.js";
        export declare function wonder(twinkle: import("./other.js").Other): string;
        "
      `);
    expect(
      await readFile(resolve(rootDir, "dist/bar/esm.d.mts"), "utf8"),
    ).toMatch("declare");

    expect(
      await readFile(resolve(rootDir, "dist/components/index.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
      "export * as jsx from "./jsx.jsx.js";
      export * as tsx from "./tsx.tsx.js";
      export * as blank from "./blank.vue.js";
      export * as scriptSetupTS from "./script-setup-ts.vue.js";
      export * as scriptMultiBlock from "./script-multi-block.vue.js";
      export * as ts from "./ts.vue.js";
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/blank.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "declare const _default: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(resolve(rootDir, "dist/components/ts.vue.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
      "declare const _default: import("vue").DefineComponent<{}, {}, {
          test: string;
          str: "test";
      }, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-multi-block.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "interface MyComponentProps {
          msg: string;
      }
      declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<__VLS_TypePropsToOption<MyComponentProps>>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_TypePropsToOption<MyComponentProps>>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
      type __VLS_TypePropsToOption<T> = {
          [K in keyof T]-?: {} extends Pick<T, K> ? {
              type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
          } : {
              type: import('vue').PropType<T[K]>;
              required: true;
          };
      };
      "
    `);

    expect(
      await readFile(
        resolve(rootDir, "dist/components/script-setup-ts.vue.d.ts"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "import { Color } from "#prop-types";
      declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<__VLS_TypePropsToOption<{
          msg: string;
          color: Color;
      }>>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_TypePropsToOption<{
          msg: string;
          color: Color;
      }>>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
      export default _default;
      type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
      type __VLS_TypePropsToOption<T> = {
          [K in keyof T]-?: {} extends Pick<T, K> ? {
              type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
          } : {
              type: import('vue').PropType<T[K]>;
              required: true;
          };
      };
      "
    `);
  }, 50_000);
});
