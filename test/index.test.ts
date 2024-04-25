import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
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
        "dist/demo.css",
        "dist/foo.mjs",
        "dist/foo.d.ts", // manual
        "dist/index.mjs",
        "dist/types.d.ts",
        "dist/star/index.mjs",
        "dist/star/other.mjs",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/bar/index.mjs",
        "dist/bar/esm.mjs",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/nested.css",
        "dist/alias.mjs",
        "dist/nestedFolder/cjs.mjs",
        "dist/nestedFolder/index.mjs",
        "dist/nestedFolder/level2a/index.mjs",
        "dist/nestedFolder/level2b/index.mjs",
        "dist/nestedFolder/level2c/index.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );
  });

  it("mkdist (resolve aliases)", async () => {
    const rootDir = resolve(__dirname, "fixture");
    const { writtenFiles } = await mkdist({
      rootDir,
      alias: { "~": resolve(rootDir, "src") },
      pattern: ["alias.ts", "nestedFolder/**"],
    });
    expect(writtenFiles.sort()).containSubset(
      [
        "dist/alias.mjs",
        "dist/nestedFolder/cjs.mjs",
        "dist/nestedFolder/index.mjs",
        "dist/nestedFolder/level2a/index.mjs",
        "dist/nestedFolder/level2b/index.mjs",
        "dist/nestedFolder/level2c/index.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );

    // Expect file to not contains any unresolved '`' alias
    const indexFile = await readFile(
      resolve(rootDir, "dist/alias.mjs"),
      "utf8",
    );
    expect(indexFile).not.toMatch("~/");

    // Expect the file to be able to execute normally
    await import(resolve(rootDir, "dist/alias.mjs")).then(async (res) =>
      expect(res.foo + (await res.bar())).toBe("foobar"),
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
        "dist/components/blank.vue",
        "dist/components/js.vue",
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
        "dist/components/blank.vue",
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
        "dist/demo.css",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/star/index.mjs",
        "dist/star/index.d.ts",
        "dist/star/other.mjs",
        "dist/star/other.d.ts",
        "dist/types.d.ts",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-setup-ts.vue",
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
        "dist/alias.mjs",
        "dist/alias.d.ts",
        "dist/nestedFolder/cjs.mjs",
        "dist/nestedFolder/cjs.d.cts",
        "dist/nestedFolder/index.mjs",
        "dist/nestedFolder/level2a/index.mjs",
        "dist/nestedFolder/level2b/index.mjs",
        "dist/nestedFolder/level2c/index.mjs",
        "dist/nestedFolder/index.d.ts",
        "dist/nestedFolder/level2a/index.d.ts",
        "dist/nestedFolder/level2b/index.d.ts",
        "dist/nestedFolder/level2c/index.d.ts",
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
        "
      `);
    expect(
      await readFile(resolve(rootDir, "dist/bar/esm.d.mts"), "utf8"),
    ).toMatch("declare");
    expect(
      await readFile(resolve(rootDir, "dist/components/ts.vue.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
        "declare const _default: import("vue").DefineComponent<{}, {}, {
            test: string;
            str: "test";
        }, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{}>>, {}, {}>;
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
        "dist/demo.scss",
        "dist/_base.scss",
        "dist/foo.mjs",
        "dist/foo.d.ts", // manual
        "dist/index.mjs",
        "dist/types.d.ts",
        "dist/star/index.mjs",
        "dist/star/other.mjs",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/jsx.mjs",
        "dist/components/tsx.mjs",
        "dist/bar/index.mjs",
        "dist/bar/esm.mjs",
        "dist/ts/test1.mjs",
        "dist/ts/test2.mjs",
        "dist/nested.css",
        "dist/alias.mjs",
        "dist/nestedFolder/cjs.mjs",
        "dist/nestedFolder/index.mjs",
        "dist/nestedFolder/level2a/index.mjs",
        "dist/nestedFolder/level2b/index.mjs",
        "dist/nestedFolder/level2c/index.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort(),
    );
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
        { contents: ["<script foo>", "Test;", "</script>"].join("\n") },
      ]);
    });

    it("vueLoader handles style tags", async () => {
      const { loadFile } = createLoader({
        loaders: ["vue", "sass"],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () =>
          '<style scoped lang="scss">$color: red; :root { background-color: $color }</style>',
        path: "test.vue",
      });
      expect(results).toMatchObject([
        {
          contents: [
            "<style scoped>",
            ":root {",
            "  background-color: red;",
            "}",
            "</style>",
          ].join("\n"),
        },
      ]);
    });

    it("vueLoader bypass <script setup>", async () => {
      const { loadFile } = createLoader({
        loaders: ["vue", "js"],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () => '<script lang="ts" setup>Test</script>',
        path: "test.vue",
      });
      expect(results).toMatchObject([{ raw: true }]);
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
});

describe("mkdist with vue-tsc v1", () => {
  beforeAll(() => {
    vi.resetModules();

    vi.doMock("pkg-types", async (importOriginal) => {
      const original = await importOriginal<typeof import("pkg-types")>();
      return {
        ...original,
        getPackageInfo: (path: string) => {
          if (path === "vue-tsc") {
            return original.readPackageJSON("vue-tsc1");
          }
          return original.readPackageJSON(path);
        },
      };
    });
    vi.doMock("vue-tsc", async () => {
      const vueTsc1 = await import("vue-tsc1");
      return {
        removeEmitGlobalTypes: (content) => content,
        ...vueTsc1,
      };
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
        "dist/demo.css",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/star/index.mjs",
        "dist/star/index.d.ts",
        "dist/star/other.mjs",
        "dist/star/other.d.ts",
        "dist/types.d.ts",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-setup-ts.vue",
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
        "
      `);
    expect(
      await readFile(resolve(rootDir, "dist/bar/esm.d.mts"), "utf8"),
    ).toMatch("declare");

    expect(
      await readFile(resolve(rootDir, "dist/components/ts.vue.d.ts"), "utf8"),
    ).toMatchInlineSnapshot(`
        "declare const _default: import("vue").DefineComponent<{}, {}, {
            test: string;
            str: "test";
        }, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{}>>, {}, {}>;
        export default _default;
        "
      `);
  }, 50_000);
});
