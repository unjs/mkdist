import type { SFCBlock } from "vue/compiler-sfc";
import type {
  InputFile,
  Loader,
  LoaderContext,
  LoaderResult,
  OutputFile,
} from "../loader";

export interface DefineVueLoaderOptions {
  blockLoaders?: {
    [blockType: string]: VueBlockLoader | undefined;
  };
}

export type VueBlock = Pick<SFCBlock, "type" | "content" | "attrs">;

export interface VueBlockLoader {
  (
    block: VueBlock,
    context: LoaderContext & {
      rawInput: InputFile;
      addOutput: (...files: OutputFile[]) => void;
    },
  ): Promise<VueBlock | undefined>;
}

export interface DefaultBlockLoaderOptions {
  type: "script" | "style" | "template";
  outputLang: string;
  validExtensions?: string[];
}

let warnedTypescript = false;
function defineVueLoader(options?: DefineVueLoaderOptions): Loader {
  const blockLoaders = options?.blockLoaders || {};

  return async (input, context) => {
    if (input.extension !== ".vue") {
      return;
    }

    const { parse } = await import("vue/compiler-sfc");

    let modified = false;

    const raw = await input.getContents();
    const sfc = parse(raw, {
      filename: input.srcPath,
      ignoreEmpty: true,
    });
    if (sfc.errors.length > 0) {
      for (const error of sfc.errors) {
        console.error(error);
      }
      return;
    }

    const isTs = [
      sfc.descriptor.script?.lang,
      sfc.descriptor.scriptSetup?.lang,
    ].some((lang) => lang && lang.startsWith("ts"));
    if (isTs && !warnedTypescript) {
      console.warn(
        "[mkdist] vue-sfc-transformer is not installed. mkdist will not transform typescript syntax in Vue SFCs.",
      );
      warnedTypescript = true;
    }

    const output: LoaderResult = [];
    const addOutput = (...files: OutputFile[]) => output.push(...files);

    const blocks: SFCBlock[] = [
      ...sfc.descriptor.styles,
      ...sfc.descriptor.customBlocks,
    ].filter((item) => !!item);

    // generate dts
    addOutput(
      {
        contents: "export default {}",
        path: `${input.path}.js`,
        srcPath: `${input.srcPath}.js`,
        extension: ".d.ts",
        declaration: true,
      },
      {
        contents: `export default {}`,
        path: input.path,
        srcPath: input.srcPath,
        extension: ".d.vue.ts",
        declaration: true,
      },
    );

    const results = await Promise.all(
      blocks.map(async (data) => {
        const blockLoader = blockLoaders[data.type];
        const result = await blockLoader?.(data, {
          ...context,
          rawInput: input,
          addOutput,
        });
        if (result) {
          modified = true;
        }
        return { block: result || data, offset: data.loc.start.offset };
      }),
    );

    if (!modified) {
      addOutput({
        path: input.path,
        srcPath: input.srcPath,
        extension: ".vue",
        contents: raw,
        declaration: false,
      });
      return output;
    }

    // skiped blocks
    if (sfc.descriptor.template) {
      results.unshift({
        block: sfc.descriptor.template,
        offset: sfc.descriptor.template.loc.start.offset,
      });
    }
    if (sfc.descriptor.script) {
      results.unshift({
        block: sfc.descriptor.script,
        offset: sfc.descriptor.script.loc.start.offset,
      });
    }
    if (sfc.descriptor.scriptSetup) {
      results.unshift({
        block: sfc.descriptor.scriptSetup,
        offset: sfc.descriptor.scriptSetup.loc.start.offset,
      });
    }

    const contents = results
      .sort((a, b) => a.offset - b.offset)
      .map(({ block }) => {
        const attrs = Object.entries(block.attrs)
          .map(([key, value]) => {
            if (!value) {
              return undefined;
            }

            return value === true ? key : `${key}="${value}"`;
          })
          .filter((item) => !!item)
          .join(" ");

        const header = `<${`${block.type} ${attrs}`.trim()}>`;
        const footer = `</${block.type}>`;

        return `${header}\n${block.content.trim()}\n${footer}\n`;
      })
      .join("\n");
    addOutput({
      path: input.path,
      srcPath: input.srcPath,
      extension: ".vue",
      contents,
      declaration: false,
    });

    return output;
  };
}

function defineDefaultBlockLoader(
  options: DefaultBlockLoaderOptions,
): VueBlockLoader {
  return async (block, { loadFile, rawInput, addOutput }) => {
    if (options.type !== block.type) {
      return;
    }

    const lang =
      typeof block.attrs.lang === "string"
        ? block.attrs.lang
        : options.outputLang;
    const extension = `.${lang}`;

    const files =
      (await loadFile({
        getContents: () => block.content,
        path: `${rawInput.path}${extension}`,
        srcPath: `${rawInput.srcPath}${extension}`,
        extension,
      })) || [];

    const blockOutputFile = files.find(
      (f) =>
        f.extension === `.${options.outputLang}` ||
        options.validExtensions?.includes(f.extension as string),
    );
    if (!blockOutputFile) {
      return;
    }
    addOutput(...files.filter((f) => f !== blockOutputFile));

    return {
      type: block.type,
      attrs: toOmit(block.attrs, "lang"),
      content: blockOutputFile.contents,
    };
  };
}

const styleLoader = defineDefaultBlockLoader({
  outputLang: "css",
  type: "style",
});

export const fallbackVueLoader = defineVueLoader({
  blockLoaders: {
    style: styleLoader,
  },
});

let cachedVueLoader: Loader | undefined;
export const vueLoader: Loader = async (
  file: InputFile,
  ctx: LoaderContext,
) => {
  if (!cachedVueLoader) {
    cachedVueLoader = await import("vue-sfc-transformer/mkdist")
      .then((r) => r.vueLoader)
      .catch(() => fallbackVueLoader);
  }
  return cachedVueLoader(file, ctx);
};

function toOmit<R extends Record<keyof object, unknown>, K extends keyof R>(
  record: R,
  toRemove: K,
): Omit<R, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== toRemove),
  ) as Omit<R, K>;
}
