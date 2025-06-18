import "./envConfig";
import { defineConfig } from "drizzle-kit";

// WRONG inside Docker:
// postgres://user:password@testDB:5433/database
// CORRECT inside Docker:
// postgres://user:password@testDB:5432/database

console.log("drizzle-test.config.ts ...");

let testUrl: string;

if (process.env.POSTGRES_URL_TESTDB) {
	testUrl = process.env.POSTGRES_URL_TESTDB;
} else {
	console.error("POSTGRES_URL_TESTDB not found in hcp vault");
	process.exit(1);
}

export default defineConfig({
	casing: "snake_case",
	dbCredentials: {
		url: testUrl,
	},
	dialect: "postgresql",
	out: "./src/db/drizzle/test/",
	schema: "./src/db/schema.ts",
});
