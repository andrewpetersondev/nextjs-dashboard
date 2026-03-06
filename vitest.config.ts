import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
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
