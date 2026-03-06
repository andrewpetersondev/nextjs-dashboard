import path from "node:path";
import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	plugins: [tsconfigPaths()],

	resolve: {
		alias: {
			"@": path.resolve(rootDir, "src"),
			"@cypress": path.resolve(rootDir, "cypress"),
			"@database": path.resolve(rootDir, "database"),
			"@devtools": path.resolve(rootDir, "devtools"),
		},
	},

	test: {
		env: {
			NODE_ENV: "test",
		},
		environment: "node",
		exclude: ["**/dist/**", "**/*.js", "**/*.mjs"],
		globals: true,
		include: ["./src/**/*.test.ts", "./src/**/*.spec.ts"],
		setupFiles: ["./vitest.setup.ts"],
	},
});
