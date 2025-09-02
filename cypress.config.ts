/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */
/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */

import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3100",

    // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
    setupNodeEvents(on, config) {
      config.env.DATABASE_ENV = process.env.DATABASE_ENV;
      config.env.DATABASE_URL = process.env.DATABASE_URL;
      config.env.SESSION_SECRET = process.env.SESSION_SECRET;

      // Database setup/teardown tasks
      on("task", {
        async "db:cleanup"() {
          const { cleanupE2EUsers } = await import(
            "./node-only/test-support/e2e-users"
          );
          await cleanupE2EUsers();
          return null;
        },
        async "db:createUser"(user: {
          email: string;
          password: string;
          username: string;
          role?: "user" | "admin" | "guest";
        }) {
          const { createUser } = await import(
            "./node-only/test-support/e2e-tasks"
          );
          await createUser(user);
          return null;
        },

        async "db:deleteUser"(email: string) {
          const { deleteUser } = await import(
            "./node-only/test-support/e2e-tasks"
          );
          await deleteUser(email);
          return null;
        },
        async "db:reset"() {
          const { resetCypressDb } = await import(
            "./node-only/test-support/reset"
          );
          await resetCypressDb();
          return null;
        },
        async "db:seed"() {
          const { mainCypTestSeed } = await import(
            "./node-only/test-support/seed"
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
            "./node-only/test-support/e2e-users"
          );
          await upsertE2EUser(user);
          return null;
        },
        async "db:truncate"() {
          const { resetCypressDb } = await import(
            "./node-only/test-support/reset"
          );
          await resetCypressDb();
          return null;
        },
        async "db:userExists"(email: string) {
          const { userExists } = await import(
            "./node-only/test-support/e2e-users"
          );
          return userExists(email);
        },
      });
      return config;
    },
  },
  env: {
    DATABASE_ENV: process.env.DATABASE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
  },
  video: false,
  watchForFileChanges: false,
});
