import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// WRONG inside Docker:
// postgres://user:password@testDB:5433/database
// CORRECT inside Docker:
// postgres://user:password@testDB:5432/database

console.log("drizzle-test.config.ts ...");

let url: string;

if (process.env.POSTGRES_TESTDB_URL_EXTERNAL) {
    url = process.env.POSTGRES_TESTDB_URL_EXTERNAL;
    console.log("Using POSTGRES_TESTDB_URL_EXTERNAL from .env");
} else {
    console.log("postgres url not found in .env");
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
