import "server-only";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "fs";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
const url = fs.readFileSync(postgresUrlFile, "utf8").trim();

console.log("database.ts ...");
console.log("DRIZZLE CONNECTING TO:", url);

if (!url) {
  console.error("Postgres URL could not be determined.");
  process.exit(1);
}

export const db = drizzle(url);
