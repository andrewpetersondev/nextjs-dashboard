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

// Ensure env is loaded before reading from env-node
const { DATABASE_URL } = await import("../env-node");

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: DATABASE_URL!,
  },
  dialect: "postgresql",
  out: "./drizzle/migrations/test/",
  schema: "./node-only/schema",
});
