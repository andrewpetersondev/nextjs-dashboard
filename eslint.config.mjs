import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintPluginCypress from "eslint-plugin-cypress";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  // Base JS rules
  js.configs.recommended,

  // Main app config (Next.js + TypeScript + Prettier)
  ...compat.config({
    extends: ["next", "next/core-web-vitals", "next/typescript", "prettier"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "eol-last": ["error", "always"],
    },
  }),

  // Cypress-specific config
  {
    files: [
      "cypress/**/*.{js,jsx,ts,tsx}",
      "cypress/**/*.json",
      "cypress/**/*.d.ts",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Cypress testing globals
        cy: "readonly",
        Cypress: "readonly",
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        beforeEach: "readonly",
        after: "readonly",
        afterEach: "readonly",
      },
    },
    plugins: {
      cypress: eslintPluginCypress,
    },
    rules: {
      // Enables Cypress recommended rules
      ...eslintPluginCypress.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
