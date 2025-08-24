import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",

    // biome-ignore lint/nursery/useExplicitType: <idk if cypress wants that>
    setupNodeEvents(on, config) {
      // Override environment variables for test database
      config.env.POSTGRES_URL = process.env.POSTGRES_URL_TESTDB;

      // Database setup/teardown tasks
      on("task", {
        // biome-ignore lint/nursery/useExplicitType: <idk if cypress wants that>
        async "db:cleanup"() {
          // Clean up test data after tests
          const { cleanupTestDatabase } = await import("./scripts/test-utils");
          return cleanupTestDatabase();
        },
        // biome-ignore lint/nursery/useExplicitType: <idk if cypress wants that>
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
  },
  video: false,
  watchForFileChanges: false,
});
