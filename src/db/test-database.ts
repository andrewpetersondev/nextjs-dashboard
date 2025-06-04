import "server-only";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

console.log("test-database.ts ...");

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
	url = process.env.POSTGRES_URL_TESTDB;
} else {
	console.error("POSTGRES_URL_TESTDB is not set.");
	process.exit(1);
}

export const testDB = drizzle(url);
