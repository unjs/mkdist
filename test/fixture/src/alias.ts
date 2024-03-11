export { foo } from "~/nestedFolder/index";
export const bar = () => import("~/nestedFolder").then((r) => r.bar);

// `require()` transform works but errors out because `mkdist` does not currently support mixed cjs and mjs building.
// export const { baz } = require("~/nestedFolder/cjs")
