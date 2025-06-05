import "server-only";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

console.log("database.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
	url = process.env.POSTGRES_URL;
} else {
	console.error("POSTGRES_URL is not set.");
	process.exit(1);
}

export const db = drizzle({ connection: url, casing: "snake_case" });
