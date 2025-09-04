/**
 *
 * @file drizzle-dev.config.ts
 * @description
 * Drizzle Kit configuration for development database migrations.
 * This file is used **only** for Drizzle Kit development operations (e.g., generating migrations, seeding the dev database).
 * This file is **not** used in Next.js runtime.
 *
 */

import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.development" });

console.log("drizzle-dev.config.ts ...");

// Ensure env is loaded before reading from env-node
const { DATABASE_URL } = await import("../config/env-node");

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: DATABASE_URL!,
  },
  dialect: "postgresql",
  out: "./drizzle/migrations/dev/",
  schema: "./node-only/schema",
});
