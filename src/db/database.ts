// this file should be server-only, but then I can not test or seed
// import "server-only"; // uncomment for production

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as fs from 'node:fs/promises';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
const url = await fs.readFile(postgresUrlFile, "utf8");

console.log("database.ts ...");
console.log("DRIZZLE CONNECTING TO:", url);

if (!url) {
  console.error("Postgres URL could not be determined.");
  process.exit(1);
}

export const db = drizzle(url);
