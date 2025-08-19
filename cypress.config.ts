/** biome-ignore-all assist/source/useSortedKeys: <explanation> */
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    downloadsFolder: "cypress/downloads",
    fixturesFolder: "cypress/fixtures",
    screenshotsFolder: "cypress/screenshots",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    videosFolder: "cypress/videos",
    env: {
      // Ensure test database is used
      POSTGRES_URL: process.env.POSTGRES_URL_TESTDB,
    },
    setupNodeEvents(on, config) {
      // Override environment variables for test database
      config.env.POSTGRES_URL = process.env.POSTGRES_URL_TESTDB;

      // Database setup/teardown tasks
      on("task", {
        async "db:seed"() {
          // Seed test database with minimal required data
          const { seedTestDatabase } = await import("./src/lib/db/test-utils");
          return seedTestDatabase();
        },

        async "db:cleanup"() {
          // Clean up test data after tests
          const { cleanupTestDatabase } = await import(
            "./src/lib/db/test-utils"
          );
          return cleanupTestDatabase();
        },
      });

      return config;
    },
  },
  video: false,
});
