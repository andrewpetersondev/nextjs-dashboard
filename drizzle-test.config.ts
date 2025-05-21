import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import * as fs from "node:fs";

// NOTE: always update schema from inside the container

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const postgresTestDbUrlFile = process.env.POSTGRES_TESTDB_URL_FILE!;
const url = fs.readFileSync(postgresTestDbUrlFile, "utf8").trim();

if (!url) {
    console.error("No database URL provided.");
    process.exit(1);
}

// console.log("drizzle-test.config.ts ...");
// console.log("DRIZZLE-TEST CONFIG CONNECTING TO:", url);

// WRONG inside Docker:
// postgres://user:password@testDB:5433/database
// CORRECT inside Docker:
// postgres://user:password@testDB:5432/database

export default defineConfig({
    out: "./src/db/drizzle/test/",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: url,
    },
});
