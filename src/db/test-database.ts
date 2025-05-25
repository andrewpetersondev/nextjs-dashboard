import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

let url: string;

if (process.env.POSTGRES_TESTDB_URL) {
    url = process.env.POSTGRES_TESTDB_URL;
    console.log("test-database.ts ...");
    console.log("DRIZZLE CONNECTING TO:", url);
} else {
    console.error("postgres testdb url is not set.");
    process.exit(1);
}

export const db = drizzle(url);
