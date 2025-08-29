/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
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
          const { seedTestDatabase } = await import("./scripts/test-utils");
          return seedTestDatabase();
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
