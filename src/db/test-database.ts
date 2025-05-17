// Only import "server-only" if not running in Cypress context
if (!process.env.CYPRESS) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    // @ts-ignore
    import("server-only");
}
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
// import * as fs from 'node:fs/promises';
import fs from "fs";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const postgresTestDbUrlFile = process.env.POSTGRES_TESTDB_URL_FILE!;
// const url = await fs.readFile(postgresTestDbUrlFile, "utf8");
const url = fs.readFileSync(postgresTestDbUrlFile, "utf8").trim();


console.log("test-database.ts ...");
console.log("DRIZZLE CONNECTING TO:", url);

if (!url) {
    console.error("Postgres URL could not be determined.");
    process.exit(1);
}

export const db = drizzle(url);
