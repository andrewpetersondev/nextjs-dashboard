import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.vitest.json"] }), react()],
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
		include: ["./src/**/*.{test,spec}.{ts,tsx}"],
		setupFiles: ["./vitest.setup.ts"],
	},
});
