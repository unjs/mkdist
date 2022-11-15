import bar from "./bar";

const foo: string = "foo";

export const importFoo = () => import("node:path");

export default () => foo + bar;
