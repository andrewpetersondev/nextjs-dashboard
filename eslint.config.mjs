import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginCypress from "eslint-plugin-cypress";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next",
    "next/core-web-vitals",
    "next/typescript",
    "prettier",
  ),
  // Cypress rules applied only to Cypress test files
  {
    files: ["cypress/**/*.{ts,tsx}", "**/*.cy.{ts,tsx}"],
    languageOptions: pluginCypress.configs.recommended.languageOptions,
    plugins: pluginCypress.configs.recommended.plugins,
    rules: pluginCypress.configs.recommended.rules,
  },
  // Revenues: discourage raw YYYY-MM strings for period. Prefer toPeriod()/dateToPeriod().
  {
    files: ["src/features/revenues/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          message:
            "Avoid raw period string (YYYY-MM). Use toPeriod() or dateToPeriod() to validate and brand.",
          selector:
            "Property[key.name='period'] > Literal[value=/^\\d{4}-(0[1-9]|1[0-2])$/]",
        },
        {
          message:
            "Avoid raw period string (YYYY-MM). Use toPeriod() or dateToPeriod() to validate and brand.",
          selector:
            "VariableDeclarator[id.name='period'] > Literal[value=/^\\d{4}-(0[1-9]|1[0-2])$/]",
        },
      ],
    },
  },
];

export default eslintConfig;
