import "./envConfig.ts";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-prod.config.ts ...");

console.log(process.env.POSTGRES_URL_PRODDB);

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: <good enough>
    url: process.env.POSTGRES_URL_PRODDB!,
  },
  dialect: "postgresql",
  out: "./src/db/migrations/prod/",
  schema: "./src/db/schema.ts",
});
