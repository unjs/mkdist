import { describe, it, expect } from "vitest";
import { transform } from "esbuild";
import { transpileVueTemplate } from "../src/utils/vue";
import { createRequire } from "node:module";

describe("vue template", () => {
  it("simple", async () => {
    expect(await fixture(`<div>{{ data!.test }}</div>`)).toEqual(
      `<div>{{ data.test }}</div>`,
    );
  });

  it("v-for", async () => {
    expect(
      await fixture(
        `<div v-for="(item as string, index) in items as unknown[]" :key="item" :index>item</div>`,
      ),
    ).toEqual(
      `<div v-for="(item, index) in items" :key="item" :index>item</div>`,
    );
  });

  async function fixture(src: string) {
    const { resolve: resolveModule } = await import("mlly");
    const requireFromVue = createRequire(await resolveModule("vue"));
    const { parse } = requireFromVue(
      "@vue/compiler-dom",
    ) as typeof import("@vue/compiler-dom-types");

    return await transpileVueTemplate(
      src,
      parse(src, { parseMode: "base" }),
      async (code) => {
        const res = await transform(code, { loader: "ts", target: "esnext" });
        return res.code;
      },
    );
  }
});
