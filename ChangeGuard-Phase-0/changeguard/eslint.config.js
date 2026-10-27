const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["eslint.config.js", "vitest.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
