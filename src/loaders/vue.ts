import type { Loader, LoaderResult } from "../loader";

export const vueLoader: Loader = async (input, context) => {
  if (input.extension !== ".vue") {
    return;
  }

  const output: LoaderResult = [
    {
      path: input.path,
      contents: await input.getContents(),
    },
  ];

  let earlyReturn = true;

  for (const blockLoader of [styleLoader, scriptLoader]) {
    const result = await blockLoader(
      { ...input, getContents: () => output[0].contents },
      context,
    );
    if (!result) {
      continue;
    }

    earlyReturn = false;
    const [vueFile, ...files] = result;
    output[0] = vueFile;
    output.push(...files);
  }

  if (earlyReturn) {
    return;
  }

  return output;
};

interface BlockLoaderOptions {
  type: "script" | "style" | "template";
  outputLang: string;
  defaultLang?: string;
  validExtensions?: string[];
  exclude?: (args: {
    lang: string;
    attributes: string;
    blockContents: string;
  }) => boolean | void;
}

const vueBlockLoader =
  (options: BlockLoaderOptions): Loader =>
  async (input, { loadFile }) => {
    const contents = await input.getContents();

    const BLOCK_RE = new RegExp(
      `<${options.type}((\\s[^>\\s]*)*)>([\\S\\s.]*?)<\\/${options.type}>`,
    );

    const [block, attributes = "", _, blockContents] =
      contents.match(BLOCK_RE) || [];

    if (!block || !blockContents) {
      return;
    }

    const [, lang = options.outputLang] =
      attributes.match(/lang="([a-z]*)"/) || [];
    const extension = "." + lang;

    if (options.exclude?.({ lang, attributes, blockContents }) === true) {
      return;
    }

    const files =
      (await loadFile({
        getContents: () => blockContents,
        path: `${input.path}${extension}`,
        srcPath: `${input.srcPath}${extension}`,
        extension,
      })) || [];

    const blockOutputFile = files.find(
      (f) =>
        f.extension === `.${options.outputLang}` ||
        options.validExtensions?.includes(f.extension),
    );
    if (!blockOutputFile) {
      return;
    }

    const newAttributes = attributes.replace(
      new RegExp(`\\s?lang="${lang}"`),
      "",
    );
    return [
      {
        path: input.path,
        contents: contents.replace(
          block,
          `<${
            options.type
          }${newAttributes}>\n${blockOutputFile.contents?.trim()}\n</${
            options.type
          }>`,
        ),
      },
      ...files.filter((f) => f !== blockOutputFile),
    ];
  };

const styleLoader = vueBlockLoader({
  outputLang: "css",
  type: "style",
});

const scriptLoader = vueBlockLoader({
  outputLang: "js",
  type: "script",
  // If the block contains some type-only Vue macros, skip the entire block
  // e.g. skip `defineProps<...>()`, but allow `defineProps(...)`
  exclude({ lang, attributes, blockContents }) {
    if (lang !== "ts" || !/\bsetup\b/.test(attributes)) {
      return false;
    }

    const CODE_COMMENT_RE = /\/\/.*\n|\/\*[\S\s]*?\*\//g;
    const contentsWithoutComments = blockContents.replace(CODE_COMMENT_RE, "");

    const macros = ["defineProps", "defineEmits", "defineSlots", "defineModel"];
    const typeOnlyMacroRE = new RegExp(
      `(${macros.join("|")})\\s*<[\\S\\s]*>\\s*\\(`,
    );
    return typeOnlyMacroRE.test(contentsWithoutComments);
  },
  validExtensions: [".js", ".mjs"],
});
