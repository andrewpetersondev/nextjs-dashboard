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
	...compat.extends("next", "next/core-web-vitals", "next/typescript", "prettier"),
	// Cypress rules applied only to Cypress test files
	{
		files: ["cypress/**/*.{ts,tsx}", "**/*.cy.{ts,tsx}"],
		languageOptions: pluginCypress.configs.recommended.languageOptions,
		plugins: pluginCypress.configs.recommended.plugins,
		rules: pluginCypress.configs.recommended.rules,
	},
];

export default eslintConfig;
