import { defineConfig } from "cypress";
import dotenv from "dotenv";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3100",

    // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
    async setupNodeEvents(on, config) {
      // Ensure .env.test is loaded before reading env
      dotenv.config({ path: ".env.test" });
      const env = await import("./node-only/config/env-node");

      config.baseUrl = env.CYPRESS_BASE_URL;
      config.env.DATABASE_ENV = env.DATABASE_ENV;
      config.env.DATABASE_URL = env.DATABASE_URL;
      config.env.SESSION_SECRET = env.SESSION_SECRET;

      // Database setup/teardown tasks
      on("task", {
        async "db:cleanup"() {
          const { cleanupE2EUsers } = await import(
            "./node-only/test-support/tasks/cleanup-e2e-users"
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
            "./node-only/test-support/tasks/create-user"
          );
          await createUser(user);
          return null;
        },

        async "db:deleteUser"(email: string) {
          const { deleteUser } = await import(
            "./node-only/test-support/tasks/delete-user"
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
            "./node-only/test-support/tasks/upsert-e2e-users"
          );
          await upsertE2EUser(user);
          return null;
        },
        async "db:userExists"(email: string) {
          const { userExists } = await import(
            "./node-only/test-support/tasks/user-exists"
          );
          return userExists(email);
        },
      });
      return config;
    },
  },
  env: {},
  video: false,
  watchForFileChanges: false,
});
