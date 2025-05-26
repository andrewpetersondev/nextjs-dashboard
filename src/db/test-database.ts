import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
    url = process.env.POSTGRES_URL_TESTDB;
    console.log("test-database.ts ...");
    console.log("DRIZZLE CONNECTING TO:", url);
} else {
    console.log("test-database.ts ...");
    console.error("POSTGRES_URL_TESTDB is not set.");
    process.exit(1);
}

export const db = drizzle(url);
