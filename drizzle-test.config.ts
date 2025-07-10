import "./envConfig.ts";
import { defineConfig } from "drizzle-kit";

// WRONG inside Docker:
// postgres://user:password@testDB:5433/database
// CORRECT inside Docker:
// postgres://user:password@testDB:5432/database

console.log("drizzle-test.config.ts ...");

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: process.env.POSTGRES_URL_TESTDB!,
  },
  dialect: "postgresql",
  out: "./src/lib/db/drizzle/test/",
  schema: "./src/lib/db/schema.ts",
});
