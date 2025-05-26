import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// WRONG inside Docker:
// postgres://user:password@testDB:5433/database
// CORRECT inside Docker:
// postgres://user:password@testDB:5432/database


let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
    console.log("drizzle-test.config.ts ...");
    url = process.env.POSTGRES_URL_TESTDB;
    console.log("Using POSTGRES_URL_TESTDB from .env.development", url);
} else {
    console.log("drizzle-test.config.ts ...");
    console.log("POSTGRES_URL_TESTDB not found in .env.development");
    process.exit(1);
}

export default defineConfig({
    out: "./src/db/drizzle/test/",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: url,
    },
});
