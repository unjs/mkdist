import bar from "~/bar";

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const foo: string = "foo";

export const importFoo = () => import("node:path");

export const dynamicLibImport = () => import("node:module");
export const dynamicImport = () => import("~/bar");

export default () => foo + bar;
