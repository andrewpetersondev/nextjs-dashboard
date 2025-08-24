import "../envConfig.ts";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-dev.config.ts ...");

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: <good enough>
    url: process.env.POSTGRES_URL!,
  },
  dialect: "postgresql",
  out: "./drizzle/migrations/dev/",
  schema: "./src/server/db/schema.ts",
});
