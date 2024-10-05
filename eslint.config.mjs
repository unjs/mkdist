import unjs from "eslint-config-unjs";

export default unjs({
  ignores: ["**/dist/**"],
  rules: {
    "@typescript-eslint/no-empty-object-type": 0,
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
