/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/style/noNonNullAssertion: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */

/**
 *
 * @file drizzle-test.config.ts
 * @description
 * Drizzle Kit configuration for test database migrations.
 * This file is used **only** for Drizzle Kit test operations (e.g., generating migrations, seeding and reseting the test database, etc).
 * This file is **not** used in Next.js runtime.
 *
 */

import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.test" });

console.log("drizzle-test.config.ts ...");

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: process.env.POSTGRES_URL_TESTDB!,
  },
  dialect: "postgresql",
  out: "./drizzle/migrations/test/",
  schema: "./node-only/schema",
});
