#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { version } from '../package.json';
import { mkdist, MkdistOptions } from "./index";

const main = defineCommand({
  meta: {
    version,
    name: 'mkdist',
    description: 'Lightweight file-to-file transformer',
  },
  args: {
    rootDir: {
      type: 'positional',
      description: 'Project root directory',
      required: false,
      default: '.',
    },
    src: {
      type: 'string',
      description: 'Source directory relative to the rootDir',
      required: false,
      default: 'src',
    },
    dist: {
      type: 'string',
      description: 'Distribution directory relative to the rootDir',
      required: false,
      default: 'dist',
    },
    pattern: {
      type: 'string',
      description: 'Pattern includes or excludes files',
      required: false,
      default: '**',
    },
    format: {
      type: 'string',
      description: 'File format',
      valueHint: 'cjs|esm',
      required: false,
    },
    declaration: {
      type: 'boolean',
      description: 'Generate type declaration file',
      required: false,
      default: false,
      alias: ['d'],
    },
    ext: {
      type: 'string',
      description: 'File extension',
      valueHint: 'mjs|js|ts',
      required: false,
    },
  },
  async run({ args: arguments_ }) {
    const { writtenFiles } = await mkdist({
      rootDir: arguments_._[0],
      srcDir: arguments_.src,
      distDir: arguments_.dist,
      format: arguments_.format,
      pattern: arguments_.pattern,
      ext: arguments_.ext,
      declaration: arguments_.declaration,
    } as MkdistOptions);

    // eslint-disable-next-line no-console
    console.log(writtenFiles.map((f) => `- ${f}`).join("\n"));

    process.exit(0);
  },
});

// eslint-disable-next-line unicorn/prefer-top-level-await
runMain(main).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
