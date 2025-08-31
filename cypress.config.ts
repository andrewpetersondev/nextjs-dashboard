/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */
/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */

import "dotenv/config";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",

    setupNodeEvents(on, config) {
      // Override environment variables for test database (provide both keys for compatibility)
      config.env.POSTGRES_URL_TESTDB = process.env.POSTGRES_URL_TESTDB;
      config.env.POSTGRES_URL = process.env.POSTGRES_URL_TESTDB;

      // Database setup/teardown tasks
      on("task", {
        async "db:cleanup"() {
          // Clean up test data after tests
          const { cleanupTestDatabase } = await import("./scripts/test-utils");
          return cleanupTestDatabase();
        },
        async "db:seed"() {
          // Seed test database with minimal required data
          // successfully seeds the test database with 1 user
          const { seedTestDatabase } = await import("./scripts/test-utils");
          return seedTestDatabase();
        },
        async "db:setup"(
          user?: {
            email?: string;
            username?: string;
            password?: string;
          } | null,
        ) {
          // Deterministic setup: cleanup then seed optional specific user
          const { setupTestDatabase } = await import("./scripts/test-utils");
          return setupTestDatabase(user ?? undefined);
        },
        async "db:userExists"(email: string) {
          const { userExists } = await import("./scripts/test-utils");
          return userExists(email);
        },
      });
      return config;
    },
  },
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL_TESTDB,
    POSTGRES_URL_TESTDB: process.env.POSTGRES_URL_TESTDB,
  },
  video: false,
  watchForFileChanges: false,
});
