import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],

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
