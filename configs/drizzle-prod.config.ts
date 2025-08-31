/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/style/noNonNullAssertion: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */

/**
 * @file drizzle-prod.config.ts
 * @description
 * Drizzle Kit configuration for production database migrations.
 * This file is used **only** for Drizzle Kit production operations (e.g., generating migrations).
 * This file is **not** used in Next.js runtime.
 *
 */

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-prod.config.ts ...");

console.log(process.env.POSTGRES_URL_PRODDB);

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: process.env.POSTGRES_URL_PRODDB!,
  },
  dialect: "postgresql",
  out: "./drizzle/migrations/prod/",
  schema: "./src/server/db/schema.ts",
});
