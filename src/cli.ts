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
    _dir: {
      type: 'positional',
      description: 'Project root directory (prefer using `--dir`)',
      default: '.',
    },
    dir: {
      type: 'string',
      description: 'Project root directory',
    },
    src: {
      type: 'string',
      description: 'Source directory relative to project root directory',
      default: 'src',
    },
    dist: {
      type: 'string',
      description: 'Distribution directory relative to project root directory',
      default: 'dist',
    },
    pattern: {
      type: 'string',
      description: 'Pattern includes or excludes files',
      default: '**',
    },
    format: {
      type: 'string',
      description: 'File format',
      valueHint: 'cjs|esm',
    },
    declaration: {
      type: 'boolean',
      description: 'Generate type declaration file',
      default: false,
      alias: ['d'],
    },
    ext: {
      type: 'string',
      description: 'File extension',
      valueHint: 'mjs|js|ts',
    },
  },
  async run({ args }) {
    console.log('args', args)
    const { writtenFiles } = await mkdist({
      rootDir: args.dir || args._dir,
      srcDir: args.src,
      distDir: args.dist,
      format: args.format,
      pattern: args.pattern,
      ext: args.ext,
      declaration: args.declaration,
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
