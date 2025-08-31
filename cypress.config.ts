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
        async "db:seed"() {
          const { mainCypTestSeed } = await import(
            "./scripts/seed-test-db-cyp-script"
          );
          await mainCypTestSeed();
          return null;
        },
        async "db:truncate"() {
          const { mainCypTruncate } = await import(
            "./scripts/truncate-test-db-script"
          );
          await mainCypTruncate();
          return null;
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
