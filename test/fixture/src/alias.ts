import { foo2bar2 } from "./nestedFolder/level2c";
import { foo2 } from "~/nestedFolder/level2a";
export { foo } from "~/nestedFolder/index";
export const bar = () => import("~/nestedFolder").then((r) => r.bar);
export const foo2bar = async () => {
  const r = await bar();
  return foo2 + r;
};
export const foo2baz2 = foo2bar2.replace('bar', 'baz')

// `require()` transform works but errors out because `mkdist` does not currently support mixed cjs and mjs building.
// export const { baz } = require("~/nestedFolder/cjs")
