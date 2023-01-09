#!/usr/bin/env node
import mri from "mri";
import { mkdist } from "./index";

async function main() {
  const arguments_ = mri(process.argv.splice(2));

  if (arguments_.help) {
    // eslint-disable-next-line no-console
    console.log(
      "Usage: npx mkdist [rootDir] [--src=src] [--dist=dist] [--pattern=glob [--pattern=more-glob]] [--format=cjs|esm] [-d|--declaration] [--ext=mjs|js|ts]"
    );
    process.exit(0);
  }

  const { writtenFiles } = await mkdist({
    rootDir: arguments_._[0],
    srcDir: arguments_.src,
    distDir: arguments_.dist,
    format: arguments_.format,
    pattern: arguments_.pattern,
    ext: arguments_.ext,
    declaration: Boolean(arguments_.declaration || arguments_.d),
  });

  // eslint-disable-next-line no-console
  console.log(writtenFiles.map((f) => `- ${f}`).join("\n"));

  process.exit(0);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
