import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import fs from "fs";

const connectionString = fs.readFileSync("/run/secrets/connection_string", "utf8").trim();

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString!
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});