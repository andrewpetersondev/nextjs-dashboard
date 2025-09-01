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
          const { cleanupE2EUsers } = await import("./test-support/e2e-users");
          await cleanupE2EUsers();
          return null;
        },
        async "db:reset"() {
          const { resetCypressDb } = await import("./test-support/reset");
          await resetCypressDb();
          return null;
        },
        async "db:seed"() {
          const { mainCypTestSeed } = await import("./test-support/seed");
          await mainCypTestSeed();
          return null;
        },
        async "db:setup"(user: {
          email: string;
          password: string;
          username?: string;
          role?: "user" | "admin" | "guest";
        }) {
          const { upsertE2EUser } = await import("./test-support/e2e-users");
          await upsertE2EUser(user);
          return null;
        },
        async "db:truncate"() {
          const { resetCypressDb } = await import("./test-support/reset");
          await resetCypressDb();
          return null;
        },
        async "db:userExists"(email: string) {
          const { userExists } = await import("./test-support/e2e-users");
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
