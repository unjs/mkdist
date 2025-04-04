import { createRequire } from "node:module";
import { transform } from "esbuild";
import { describe, it, expect } from "vitest";
import { transpileVueTemplate } from "../src/utils/vue/template";
import { createLoader } from "../src/loader";

describe("vueLoader", () => {
  describe("transform typescript template", () => {
    it("v-for", async () => {
      expect(
        await fixture(
          `<div v-for="item as string in items as unknown[]" :key="item">{{ item }}</div>`,
        ),
      ).toEqual(`<div v-for="item in items" :key="item">{{ item }}</div>`);
      expect(
        await fixture(
          `<div v-for="(item as string, index) in items as unknown[]" :key="item" :index>{{ item }}</div>`,
        ),
      ).toEqual(
        `<div v-for="(item, index) in items" :key="item" :index>{{ item }}</div>`,
      );
    });

    it("v-if", async () => {
      expect(await fixture(`<div v-if="(data as any).test" />`)).toEqual(
        `<div v-if="data.test" />`,
      );
    });

    it("v-show", async () => {
      expect(await fixture(`<div v-show="(data as any).show" />`)).toEqual(
        `<div v-show="data.show" />`,
      );
    });

    it("v-model", async () => {
      expect(await fixture(`<input v-model="(data as string)" />`)).toEqual(
        `<input v-model="data" />`,
      );
    });

    it("v-on", async () => {
      expect(
        await fixture(`<div @click="handleClick as () => void" />`),
      ).toEqual(`<div @click="handleClick" />`);
      expect(await fixture(`<div @click="handleClick()" />`)).toEqual(
        `<div @click="handleClick()" />`,
      );
      expect(
        await fixture(
          `<div @click="(e: unknown) => handleClick(e as MouseEvent)" />`,
        ),
      ).toEqual(`<div @click="(e) => handleClick(e)" />`);
    });

    it("custom directives", async () => {
      expect(
        await fixture(`<div v-highlight="(highlight as boolean)" />`),
      ).toEqual(`<div v-highlight="highlight" />`);
    });

    it("v-bind", async () => {
      expect(await fixture(`<div v-bind="(props as any)" />`)).toEqual(
        `<div v-bind="props" />`,
      );
      expect(
        await fixture(`<div :key="(value as any)" data-test="test" />`),
      ).toEqual(`<div :key="value" data-test="test" />`);
      expect(await fixture(`<input disabled />`)).toEqual(`<input disabled />`);
      expect(await fixture(`<input :disabled />`)).toEqual(
        `<input :disabled />`,
      );
      expect(await fixture(`<input v-bind:disabled />`)).toEqual(
        `<input v-bind:disabled />`,
      );
    });

    it("interpolation", async () => {
      expect(await fixture(`<div>{{ data!.test }}</div>`)).toEqual(
        `<div>{{ data.test }}</div>`,
      );
      expect(await fixture(`<div>hi {{ data!.test }}</div>`)).toEqual(
        `<div>hi {{ data.test }}</div>`,
      );
      expect(
        await fixture(
          `<div>{{ typeof data!.test === "string" ? data!.test : getKey(data!.test) }}</div>`,
        ),
      ).toEqual(
        `<div>{{ typeof data.test === "string" ? data.test : getKey(data.test) }}</div>`,
      );
    });

    it("keep comments", async () => {
      expect(
        await fixture(`<div>{{ data!.test }}</div><!-- comment -->`),
      ).toEqual(`<div>{{ data.test }}</div><!-- comment -->`);
    });

    it("keep text", async () => {
      expect(await fixture(`<div>data!.test</div>`)).toEqual(
        `<div>data!.test</div>`,
      );
    });

    it("keep empty", async () => {
      expect(await fixture(`<div>{{}}</div>`)).toEqual(`<div>{{}}</div>`);
      expect(await fixture(`<div @click="" />`)).toEqual(`<div @click="" />`);
    });

    it("keep error", async () => {
      expect(await fixture(`<div>{{ data. }}</div>`)).toEqual(
        `<div>{{ data. }}</div>`,
      );
    });

    it("quotes", async () => {
      expect(await fixture(`<div @click="emit('click')" />`)).toEqual(
        `<div @click="emit('click')" />`,
      );
      expect(await fixture(`<div @click='emit("click")' />`)).toEqual(
        `<div @click='emit("click")' />`,
      );
      expect(await fixture(`<div @click="emit('click', '\\'')" />`)).toEqual(
        `<div @click="emit('click', '\\'')" />`,
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
        0,
        async (code) => {
          const res = await transform(code, { loader: "ts", target: "esnext" });
          return res.code;
        },
      );
    }
  });

  describe("transform typescript script setup", () => {
    it("defineProps", async () => {
      expect(
        await fixture(
          `<script setup lang="ts">defineProps<{ msg: string }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
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
        await fixture(
          `<script setup lang="ts">const props = defineProps<{ msg: string }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        const props = defineProps({
          msg: {
            type: String,
            required: true
          }
        });
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">const { msg } = defineProps<{ msg: string }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        const { msg } = defineProps({
          msg: {
            type: String,
            required: true
          }
        });
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">const { msg = 'hello' } = defineProps<{ msg?: string }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        const { msg = "hello" } = defineProps({
          msg: {
            type: String,
            required: false
          }
        });
        </script>
        "
      `);
    });

    it("withDefaults", async () => {
      expect(
        await fixture(
          `<script setup lang="ts">const props = withDefaults(defineProps<{ msg?: string }>(), { msg: 'hi' })</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        const props = defineProps({
          msg: {
            type: String,
            required: false,
            default: "hi"
          }
        });
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">withDefaults(defineProps<{ msg?: string }>(), { msg: 'hi' })</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineProps({
          msg: {
            type: String,
            required: false,
            default: "hi"
          }
        });
        </script>
        "
      `);
    });

    it("defineEmits", async () => {
      expect(
        await fixture(
          `<script setup lang="ts">const emit = defineEmits<{ click: [] }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        const emit = defineEmits(["click"]);
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineEmits<{ click: [] }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineEmits(["click"]);
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineEmits<{ click: [msg: string] }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineEmits(["click"]);
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineEmits<{ (e: 'click'): any }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineEmits(["click"]);
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineEmits<{ (e: 'click', msg: string): any }>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineEmits(["click"]);
        </script>
        "
      `);
    });

    it("defineModel", async () => {
      expect(
        await fixture(
          `<script setup lang="ts">const model = defineModel<string>()</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        const model = defineModel({
          "type": String
        });
        </script>
        "
      `);
      expect(
        await fixture(`<script setup lang="ts">defineModel<string>()</script>`),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineModel({
          "type": String
        });
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineModel<string>('msg')</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineModel("msg", {
          "type": String
        });
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineModel<string>({ required: true })</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineModel({
          "type": String,
          ...{
            required: true
          }
        });
        </script>
        "
      `);
      expect(
        await fixture(
          `<script setup lang="ts">defineModel<string>('msg', { required: true })</script>`,
        ),
      ).toMatchInlineSnapshot(`
        "<script setup>
        defineModel("msg", {
          "type": String,
          ...{
            required: true
          }
        });
        </script>
        "
      `);
    });

    async function fixture(src: string): Promise<string> {
      const { loadFile } = createLoader({ loaders: ["vue", "js"] });
      const results = await loadFile({
        extension: ".vue",
        getContents: () => src,
        path: "test.vue",
      });
      return results?.[0]?.contents || src;
    }
  });
});
