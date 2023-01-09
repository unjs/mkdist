import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
import { describe, it, expect, beforeEach } from "vitest";
import { mkdist } from "../src/make";
import { createLoader } from "../src/loader";
import { jsLoader, sassLoader, vueLoader } from "../src/loaders";

const rootDir = resolve(__dirname, "fixture");

describe("mkdist", () => {
  it("mkdist", async () => {
    const { writtenFiles } = await mkdist({ rootDir });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/demo.css",
        "dist/foo.mjs",
        "dist/foo.d.ts", // manual
        "dist/index.mjs",
        "dist/types.d.ts",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/bar/index.mjs",
        "dist/bar/esm.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );
  });

  it("mkdist (cjs)", async () => {
    const { writtenFiles } = await mkdist({ rootDir, format: "cjs" });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/demo.css",
        "dist/foo.js",
        "dist/foo.d.ts", // manual
        "dist/index.js",
        "dist/types.d.ts",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/bar/index.js",
        "dist/bar/esm.js",
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );

    expect(await readFile(resolve(rootDir, "dist/index.js"), "utf8")).toMatch(
      "module.exports = _default;"
    );
  });

  it("mkdist (custom glob pattern)", async () => {
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
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );
  });

  it("mkdist (multiple glob patterns)", async () => {
    const { writtenFiles } = await mkdist({
      rootDir,
      pattern: ["components/**", "!components/js.vue"],
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/components/blank.vue",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );
  });

  it("mkdist (custom extension)", async () => {
    const { writtenFiles } = await mkdist({
      rootDir,
      pattern: "**/!(*.d).?(m){js,ts}",
      ext: "mjs",
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/bar/esm.mjs",
        "dist/bar/index.mjs",
        "dist/foo.mjs",
        "dist/index.mjs",
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );
  });

  it("mkdist (emit types)", async () => {
    const { writtenFiles } = await mkdist({ rootDir, declaration: true });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/demo.css",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/types.d.ts",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/ts.vue.d.ts",
        "dist/bar/index.mjs",
        "dist/bar/index.d.ts",
        "dist/bar/esm.mjs",
        "dist/bar/esm.d.mts",
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );

    expect(await readFile(resolve(rootDir, "dist/foo.d.ts"), "utf8")).toMatch(
      "manual declaration"
    );
    expect(
      await readFile(resolve(rootDir, "dist/bar/esm.d.mts"), "utf8")
    ).toMatch("declare");
  }, 10_000);

  it("mkdist (emit types + maps)", async () => {
    const { writtenFiles } = await mkdist({
      rootDir,
      declaration: true,
      declarationMap: true,
    });
    expect(writtenFiles.sort()).toEqual(
      [
        "dist/README.md",
        "dist/demo.css",
        "dist/foo.mjs",
        "dist/foo.d.ts",
        "dist/index.mjs",
        "dist/index.d.ts",
        "dist/index.d.ts.map",
        "dist/types.d.ts",
        "dist/components/blank.vue",
        "dist/components/js.vue",
        "dist/components/js.vue.d.ts",
        "dist/components/js.vue.d.ts.map",
        "dist/components/script-setup-ts.vue",
        "dist/components/ts.vue",
        "dist/components/ts.vue.d.ts",
        "dist/components/ts.vue.d.ts.map",
        "dist/bar/index.mjs",
        "dist/bar/index.d.ts",
        "dist/bar/index.d.ts.map",
        "dist/bar/esm.mjs",
        "dist/bar/esm.d.mts",
        "dist/bar/esm.d.mts.map",
      ]
        .map((f) => resolve(rootDir, f))
        .sort()
    );

    expect(
      await readFile(resolve(rootDir, "dist/index.d.ts.map"), "utf8")
    ).toMatch(
      '"file":"index.d.ts","sourceRoot":"","sources":["../src/index.ts"]'
    );
  }, 10_000);

  describe("mkdist (sass compilation)", () => {
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
        "utf8"
      );

      expect(vue).toMatch("color: green;\n  background-color: red;");
    });
  });

  describe("createLoader", () => {
    it("loadFile returns undefined for an unsupported file", async () => {
      const { loadFile } = createLoader();
      const results = await loadFile({
        extension: ".noth",
        getContents: () => new Error("this should not be called") as any,
        path: "another.noth",
      });
      expect(results).toMatchObject([{ type: "raw" }]);
    });

    it("vueLoader handles no transpilation of script tag", async () => {
      const { loadFile } = createLoader({
        loaders: [vueLoader],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () => "<script>Test</script>",
        path: "test.vue",
      });
      expect(results).toMatchObject([{ type: "raw" }]);
    });

    it("vueLoader handles script tags with attributes", async () => {
      const { loadFile } = createLoader({
        loaders: [vueLoader, jsLoader],
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
        loaders: [vueLoader, sassLoader],
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
        loaders: [vueLoader, jsLoader],
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () => '<script lang="ts" setup>Test</script>',
        path: "test.vue",
      });
      expect(results).toMatchObject([{ type: "raw" }]);
    });

    it("vueLoader will generate dts file", async () => {
      const { loadFile } = createLoader({
        loaders: [vueLoader, jsLoader],
        declaration: true,
      });
      const results = await loadFile({
        extension: ".vue",
        getContents: () =>
          '<script lang="ts">export default bob = 42 as const</script>',
        path: "test.vue",
      });
      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "dts" })])
      );
    });

    it("jsLoader will generate dts file (.js)", async () => {
      const { loadFile } = createLoader({
        loaders: [jsLoader],
        declaration: true,
      });
      const results = await loadFile({
        extension: ".js",
        getContents: () => "export default bob = 42",
        path: "test.mjs",
      });
      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "dts" })])
      );
    });

    it("jsLoader will generate dts file (.ts)", async () => {
      const { loadFile } = createLoader({
        loaders: [jsLoader],
        declaration: true,
      });
      const results = await loadFile({
        extension: ".ts",
        getContents: () => "export default bob = 42 as const",
        path: "test.ts",
      });
      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "dts" })])
      );
    });
  });
});
