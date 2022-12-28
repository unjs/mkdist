import type { Loader, LoaderResult } from "../loader";

export const vueLoader: Loader = async (input, context) => {
  if (input.extension !== ".vue") {
    return;
  }

  const output: LoaderResult = [{
    path: input.path,
    contents: await input.getContents()
  }];

  let earlyReturn = true;

  for (const blockLoader of [sassLoader, scriptLoader]) {
    const result = await blockLoader({ ...input, getContents: () => output[0].contents! }, context);
    if (!result) { continue; }

    earlyReturn = false;
    const [vueFile, ...files] = result;
    output[0] = vueFile;
    output.push(...files);
  }

  if (earlyReturn) { return; }

  return output;
};

interface BlockLoaderOptions {
  type: "script" | "style" | "template"
  outputLang: string
  defaultLang?: string
  validExtensions?: string[]
  exclude?: RegExp[]
}

const vueBlockLoader = (options: BlockLoaderOptions): Loader => async (input, { loadFile }) => {
  const contents = await input.getContents();

  const BLOCK_RE = new RegExp(`<${options.type}((\\s[^>\\s]*)*)>([\\S\\s.]*?)<\\/${options.type}>`);
  // eslint-disable-next-line no-unused-vars
  const [block, attributes = "", _, blockContents] = contents.match(BLOCK_RE) || [];

  if (!block || !blockContents) {
    return;
  }

  if (options.exclude?.some(re => re.test(attributes))) {
    return;
  }

  const [, lang = options.outputLang] = attributes.match(/lang="([a-z]*)"/) || [];
  const extension = "." + lang;

  const files = await loadFile({
    getContents: () => blockContents,
    path: `${input.path}${extension}`,
    srcPath: `${input.srcPath}${extension}`,
    extension
  }) || [];

  const blockOutputFile = files.find(f => f.extension === `.${options.outputLang}` || options.validExtensions?.includes(f.extension!));
  if (!blockOutputFile) { return; }

  const newAttributes = attributes.replace(new RegExp(`\\s?lang="${lang}"`), "");
  return [
    {
      path: input.path,
      type: "vue",
      contents: contents.replace(block, `<${options.type}${newAttributes}>\n${blockOutputFile.contents?.trim()}\n</${options.type}>`)
    },
    ...files.filter(f => f !== blockOutputFile)
  ];
};

const sassLoader = vueBlockLoader({
  outputLang: "css",
  type: "style"
});

const scriptLoader = vueBlockLoader({
  outputLang: "js",
  type: "script",
  exclude: [/\bsetup\b/],
  validExtensions: [".js", ".mjs"]
});
