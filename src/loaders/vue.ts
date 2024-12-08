import type { SFCBlock } from "vue/compiler-sfc";
import type {
  InputFile,
  Loader,
  LoaderContext,
  LoaderResult,
  OutputFile,
} from "../loader";

import fs from "node:fs";
import { basename, dirname, resolve } from "pathe";

import { compileScript, parse } from "vue/compiler-sfc";

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
  defaultLang?: string;
  validExtensions?: string[];
}

export function defineVueLoader(options?: DefineVueLoaderOptions): Loader {
  const blockLoaders = options?.blockLoaders || {};

  return async (input, context) => {
    if (input.extension !== ".vue") {
      return;
    }

    let modified = false;
    let fakeScriptBlock = false;

    const raw = await input.getContents();
    const sfc = parse(raw, {
      filename: basename(input.path),
      ignoreEmpty: true,
    });
    if (sfc.errors.length > 0) {
      for (const error of sfc.errors) {
        console.error(error);
      }
      return;
    }

    const output: LoaderResult = [];
    const addOutput = (...files: OutputFile[]) => output.push(...files);

    const blocks: VueBlock[] = [
      sfc.descriptor.template,
      ...sfc.descriptor.styles,
      ...sfc.descriptor.customBlocks,
    ].filter((item) => !!item);
    // merge script blocks
    if (sfc.descriptor.script || sfc.descriptor.scriptSetup) {
      // need to compile script when using typescript with <script setup>
      if (sfc.descriptor.scriptSetup && sfc.descriptor.scriptSetup.lang) {
        const merged = compileScript(sfc.descriptor, {
          id: input.path,
          fs: createFs(input.srcPath),
        });
        merged.setup = false;
        merged.attrs = toOmit(merged.attrs, "setup");
        blocks.unshift(merged);
      } else {
        const scriptBlocks = [
          sfc.descriptor.script,
          sfc.descriptor.scriptSetup,
        ].filter((item) => !!item);
        blocks.unshift(...scriptBlocks);
      }
    } else {
      // push a fake script block to generate dts
      blocks.unshift({
        type: "script",
        content: "export default {}",
        attrs: {},
      });
      fakeScriptBlock = true;
    }

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
        return result || data;
      }),
    );

    if (!modified) {
      return;
    }

    const contents = results
      .map((block) => {
        if (block.type === "script" && fakeScriptBlock) {
          return undefined;
        }

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

        return `${header}\n${cleanupBreakLine(block.content)}\n${footer}\n`;
      })
      .filter((item) => !!item)
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

export function defineDefaultBlockLoader(
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
    if (!blockOutputFile?.contents) {
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

const scriptLoader = defineDefaultBlockLoader({
  outputLang: "js",
  type: "script",
  validExtensions: [".js", ".mjs"],
});

export const vueLoader = defineVueLoader({
  blockLoaders: {
    style: styleLoader,
    script: scriptLoader,
  },
});

function createFs(pwd?: string) {
  const realpath = (...paths: string[]) =>
    pwd ? resolve(dirname(pwd), ...paths) : resolve(...paths);
  const fileExists = (file: string) => {
    try {
      if (!pwd) {
        return false;
      }
      const path = realpath(file);

      fs.accessSync(path);
      return fs.lstatSync(path).isFile();
    } catch {
      return false;
    }
  };
  const readFile = (file: string) => {
    return fs.readFileSync(realpath(file), "utf8");
  };

  return { realpath, fileExists, readFile };
}
function cleanupBreakLine(str: string): string {
  return str.replaceAll(/(\n\n)\n+/g, "\n\n").replace(/^\s*\n|\n\s*$/g, "");
}
function toOmit<R extends Record<keyof object, unknown>, K extends keyof R>(
  record: R,
  toRemove: K,
): Omit<R, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== toRemove),
  ) as Omit<R, K>;
}
