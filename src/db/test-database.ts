import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as fs from 'node:fs/promises';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const postgresTestDbUrlFile = process.env.POSTGRES_TESTDB_URL_FILE!;
const url = await fs.readFile(postgresTestDbUrlFile, "utf8");

console.log("test-database.ts ...");
console.log("DRIZZLE CONNECTING TO:", url);

if (!url) {
    console.error("Postgres URL could not be determined.");
    process.exit(1);
}

export const db = drizzle(url);
