import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  // TypeScript base rules
  ...tseslint.configs.recommended,

  // Astro component rules
  ...eslintPluginAstro.configs.recommended,

  // Project-specific overrides
  {
    rules: {
      // Allow unused vars prefixed with _ (common Astro pattern)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Allow any types in data files (JSON-driven content)
      "@typescript-eslint/no-explicit-any": "warn",
      // Enforce consistent return types
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // Ignore build output and dependencies
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".astro/",
      ".netlify/",
      "scripts/*.mjs",
    ],
  },
];
