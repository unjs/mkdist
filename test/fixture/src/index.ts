import bar from "./bar";

const foo: string = "foo";

export const importFoo = () => import("node:path");

export const dynamicLibImport = () => import("node:module");
export const dynamicImport = () => import("./bar");

export default function add() {
  return foo + bar;
}
