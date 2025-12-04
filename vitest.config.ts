import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    env: {
      // Load test environment variables
      // biome-ignore lint/style/useNamingConvention: <ignore for now>
      NODE_ENV: "test",
    },
    // Default to node environment for server-side tests
    // Use jsdom for component tests (can override per-file with @vitest-environment jsdom)
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.js", "**/*.mjs"],
    globals: true,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
