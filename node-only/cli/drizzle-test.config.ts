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
// const { DATABASE_URL } = await import("../config/env-node"); // this line broke cli because drizzle-kit does not allow top level await. but it worked before??

// let url: string;
// if (DATABASE_URL) {
//   url = DATABASE_URL;
// } else {
//   throw new Error("DATABASE_URL is not set.");
// }

// biome-ignore lint/style/noProcessEnv: <inevitable>
// biome-ignore lint/correctness/noProcessGlobal: <inevitable>
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set.");
}

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url,
  },
  dialect: "postgresql",
  out: "./drizzle/migrations/test/",
  schema: "./node-only/schema",
});
