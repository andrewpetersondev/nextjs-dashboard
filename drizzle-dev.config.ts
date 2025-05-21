import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import * as fs from "node:fs";

// NOTE: always update schema from inside the container

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
const url = fs.readFileSync(postgresUrlFile, "utf8").trim();

if (!url) {
  console.error("No database URL provided.");
  process.exit(1);
}

// console.log("drizzle-dev.config.ts ...");
// console.log("DRIZZLE CONFIG CONNECTING TO:", url);

export default defineConfig({
  out: "./src/db/drizzle/",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url,
  },
});
