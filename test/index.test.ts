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
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-multi-block.vue",
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
  }, 50_000);

  describe("mkdist (declarationExt: infer)", () => {
    it.each([
      {
        format: "cjs",
        ext: undefined,
        implicitFiles: [
          "dist/foo.js",
          "dist/foo.d.ts",
          "dist/index.js",
          "dist/index.d.ts",
          "dist/star/index.js",
          "dist/star/index.d.ts",
          "dist/star/other.js",
          "dist/star/other.d.ts",
          "dist/types.d.ts",
          "dist/bar/index.js",
          "dist/bar/index.d.ts",
          "dist/bar/esm.js",
          "dist/bar/esm.d.ts",
          "dist/ts/test1.js",
          "dist/ts/test2.js",
          "dist/ts/test1.d.ts",
          "dist/ts/test2.d.ts",
          "dist/components/js.vue.d.ts",
          "dist/components/ts.vue.d.ts",
          "dist/components/jsx.js",
          "dist/components/tsx.js",
          "dist/components/jsx.d.ts",
          "dist/components/tsx.d.ts",
        ],
      },
      // not setting the format explicitly should work like esm
      ...(["esm", undefined] as const).map((format) => ({
        format,
        ext: undefined,
        implicitFiles: [
          "dist/foo.mjs",
          "dist/foo.d.mts",
          "dist/index.mjs",
          "dist/index.d.mts",
          "dist/star/index.mjs",
          "dist/star/index.d.mts",
          "dist/star/other.mjs",
          "dist/star/other.d.mts",
          "dist/types.d.mts",
          "dist/bar/index.mjs",
          "dist/bar/index.d.mts",
          "dist/bar/esm.mjs",
          "dist/bar/esm.d.mts",
          "dist/ts/test1.mjs",
          "dist/ts/test2.mjs",
          "dist/ts/test1.d.mts",
          "dist/ts/test2.d.mts",
          "dist/components/js.vue.d.mts",
          "dist/components/ts.vue.d.mts",
          "dist/components/jsx.mjs",
          "dist/components/tsx.mjs",
          "dist/components/jsx.d.mts",
          "dist/components/tsx.d.mts",
        ],
      })),
      ...(["cjs", "esm", undefined] as const).flatMap((format) =>
        (["js", "mjs", "cjs", "ts", "mts", "cts"] as const).map((ext) => {
          const [srcExt, dtsExt, emitsVue = false] = {
            js: ["js", "d.ts", true],
            mjs: ["mjs", "d.mts", true],
            cjs: ["cjs", "d.cts"],
            ts: ["ts", "d.ts", true],
            mts: ["mts", "d.mts", true],
            cts: ["cts", "d.cts"],
          }[ext];

          return {
            format,
            ext,
            implicitFiles: [
              `dist/foo.${srcExt}`,
              `dist/foo.${dtsExt}`,
              `dist/index.${srcExt}`,
              `dist/index.${dtsExt}`,
              `dist/star/index.${srcExt}`,
              `dist/star/index.${dtsExt}`,
              `dist/star/other.${srcExt}`,
              `dist/star/other.${dtsExt}`,
              `dist/types.${dtsExt}`,
              `dist/bar/index.${srcExt}`,
              `dist/bar/index.${dtsExt}`,
              `dist/bar/esm.${srcExt}`,
              `dist/bar/esm.${dtsExt}`,
              `dist/ts/test1.${srcExt}`,
              `dist/ts/test2.${srcExt}`,
              `dist/ts/test1.${dtsExt}`,
              `dist/ts/test2.${dtsExt}`,
              `dist/components/jsx.${srcExt}`,
              `dist/components/tsx.${srcExt}`,
              `dist/components/jsx.${dtsExt}`,
              `dist/components/tsx.${dtsExt}`,
              ...(emitsVue
                ? [
                    `dist/components/js.vue.${dtsExt}`,
                    `dist/components/ts.vue.${dtsExt}`,
                  ]
                : []),
            ],
          };
        }),
      ),
    ] as const)(
      "format: $format, ext: $ext",
      async ({ format, ext, implicitFiles }) => {
        const rootDir = resolve(__dirname, "fixture");
        const { writtenFiles } = await mkdist({
          rootDir,
          format,
          ext,
          declaration: true,
          declarationExt: "infer",
        });
        expect(writtenFiles.sort()).toEqual(
          [
            "dist/README.md",
            "dist/demo.css",
            "dist/components/blank.vue",
            "dist/components/js.vue",
            "dist/components/script-setup-ts.vue",
            "dist/components/ts.vue",
            "dist/nested.css",
            ...implicitFiles,
          ]
            .map((f) => resolve(rootDir, f))
            .sort(),
        );
      },
    );
  }, 50_000);

  it.each(["d.ts", "d.mts", "d.cts"] as const)(
    "mkdist (declarationExt: %s)",
    async (declarationExt) => {
      const rootDir = resolve(__dirname, "fixture");
      const { writtenFiles } = await mkdist({
        rootDir,
        declaration: true,
        declarationExt,
      });
      expect(writtenFiles.sort()).toEqual(
        [
          "dist/README.md",
          "dist/demo.css",
          "dist/foo.mjs",
          `dist/foo.${declarationExt}`,
          "dist/index.mjs",
          `dist/index.${declarationExt}`,
          "dist/star/index.mjs",
          `dist/star/index.${declarationExt}`,
          "dist/star/other.mjs",
          `dist/star/other.${declarationExt}`,
          `dist/types.${declarationExt}`,
          "dist/components/blank.vue",
          "dist/components/js.vue",
          `dist/components/js.vue.${declarationExt}`,
          "dist/components/script-setup-ts.vue",
          "dist/components/ts.vue",
          `dist/components/ts.vue.${declarationExt}`,
          "dist/components/jsx.mjs",
          "dist/components/tsx.mjs",
          `dist/components/jsx.${declarationExt}`,
          `dist/components/tsx.${declarationExt}`,
          "dist/bar/index.mjs",
          `dist/bar/index.${declarationExt}`,
          "dist/bar/esm.mjs",
          `dist/bar/esm.${declarationExt}`,
          "dist/ts/test1.mjs",
          "dist/ts/test2.mjs",
          `dist/ts/test1.${declarationExt}`,
          `dist/ts/test2.${declarationExt}`,
          "dist/nested.css",
        ]
          .map((f) => resolve(rootDir, f))
          .sort(),
      );
    },
  );

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
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-multi-block.vue",
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
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-multi-block.vue",
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
        resolve(rootDir, "dist/components/script-multi-block.vue"),
        "utf8",
      ),
    ).toMatchInlineSnapshot(`
      "<template>
        <div>{{ msg }}</div>
      </template>

      <script lang="ts">
      interface MyComponentProps {
        msg: string;
      }
      </script>

      <script setup lang="ts">
      defineProps<MyComponentProps>();
      </script>
      "
    `);
  }, 50_000);
});
