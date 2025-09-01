/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */
/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */

import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

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
          const { cleanupE2EUsers } = await import(
            "./scripts/seed-test-db-cyp-script"
          );
          await cleanupE2EUsers();
          return null;
        },
        async "db:seed"() {
          const { mainCypTestSeed } = await import(
            "./scripts/seed-test-db-cyp-script"
          );
          await mainCypTestSeed();
          return null;
        },
        async "db:setup"(user: {
          email: string;
          password: string;
          username?: string;
          role?: "user" | "admin" | "guest";
        }) {
          const { upsertE2EUser } = await import(
            "./scripts/seed-test-db-cyp-script"
          );
          await upsertE2EUser(user);
          return null;
        },
        async "db:truncate"() {
          const { mainCypTruncate } = await import(
            "./scripts/truncate-test-db-script"
          );
          await mainCypTruncate();
          return null;
        },
        async "db:userExists"(email: string) {
          const { userExists } = await import(
            "./scripts/seed-test-db-cyp-script"
          );
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
