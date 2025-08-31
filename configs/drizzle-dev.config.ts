/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/style/noNonNullAssertion: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */

/**
 *
 * @file drizzle-dev.config.ts
 * @description
 * Drizzle Kit configuration for development database migrations.
 * This file is used **only** for Drizzle Kit development operations (e.g., generating migrations, seeding the dev database).
 * This file is **not** used in Next.js runtime.
 *
 */

import "../envConfig.ts";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-dev.config.ts ...");

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  dialect: "postgresql",
  out: "../drizzle/migrations/dev/",
  schema: "../src/server/db/schema.ts",
});
