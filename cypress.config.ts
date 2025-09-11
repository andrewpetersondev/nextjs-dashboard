import { defineConfig } from "cypress";
import dotenv from "dotenv";
import { CYPRESS_BASE_URL } from "./node-only/config/env-node";

export default defineConfig({
  e2e: {
    // process.env variables are different from Cypress config/env.
    // In tests, prefer using Cypress.env() and Cypress config values.
    // .env.test.local is loaded in setupNodeEvents to override defaults.
    // The baseUrl below is a fallback; set CYPRESS_BASE_URL in .env.test.local to override it.
    baseUrl: CYPRESS_BASE_URL,

    // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <it's clean>
    async setupNodeEvents(on, config) {
      // Ensure .env.test.local is loaded before reading env
      dotenv.config({ path: ".env.test.local" });

      const env = await import("./node-only/config/env-node");

      // Set Cypress config values from env. baseUrl is a fallback and overridden by the value in .env.test.local
      // baseUrl is not in the cypress env variables so it is not accessed with config.env.baseUrl but instead with config.baseUrl
      config.baseUrl = env.CYPRESS_BASE_URL;
      config.env.DATABASE_ENV = env.DATABASE_ENV;
      config.env.DATABASE_URL = env.DATABASE_URL;
      config.env.SESSION_SECRET = env.SESSION_SECRET;

      // Small helper to DRY api-calls-based tasks
      const callOkJson = async (path: string) => {
        const url = new URL(path, config.baseUrl!).toString();
        const res = await fetch(url, { method: "GET" });
        const body = await res.json().catch(() => ({}));
        if (
          !res.ok ||
          (body && typeof body === "object" && body.ok === false)
        ) {
          throw new Error(
            `${path} failed: status=${res.status} body=${JSON.stringify(body)}`,
          );
        }
        return null as null;
      };

      // Database setup/teardown tasks
      on("task", {
        async "db:cleanup"() {
          const { cleanupE2EUsers } = await import(
            "./node-only/tasks/cleanup-e2e-users"
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
          const { createUser } = await import("./node-only/tasks/create-user");
          await createUser(user);
          return null;
        },

        async "db:deleteUser"(email: string) {
          const { deleteUser } = await import("./node-only/tasks/delete-user");
          await deleteUser(email);
          return null;
        },
        async "db:reset"() {
          return await callOkJson("/api/db/reset");
        },
        async "db:seed"() {
          return await callOkJson("/api/db/seed");
        },
        async "db:setup"(user: {
          email: string;
          password: string;
          username?: string;
          role?: "user" | "admin" | "guest";
        }) {
          const { upsertE2EUser } = await import(
            "./node-only/tasks/upsert-e2e-users"
          );
          await upsertE2EUser(user);
          return null;
        },
        async "db:userExists"(email: string) {
          const { userExists } = await import("./node-only/tasks/user-exists");
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
