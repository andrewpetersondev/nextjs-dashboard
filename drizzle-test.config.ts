import "./envConfig";
import { defineConfig } from "drizzle-kit";
import { POSTGRES_URL_TESTDB } from "./src/config/env";

// WRONG inside Docker:
// postgres://user:password@testDB:5433/database
// CORRECT inside Docker:
// postgres://user:password@testDB:5432/database

console.log("drizzle-test.config.ts ...");

export default defineConfig({
	casing: "snake_case",
	dbCredentials: {
		url: POSTGRES_URL_TESTDB,
	},
	dialect: "postgresql",
	out: "./src/lib/db/drizzle/test/",
	schema: "./src/lib/db/schema.ts",
});

// export const drizzleTestConfig = defineConfig({
// 	casing: "snake_case",
// 	dbCredentials: {
// 		url: POSTGRES_URL_TESTDB,
// 	},
// 	dialect: "postgresql",
// 	out: "./src/lib/db/drizzle/test/",
// 	schema: "./src/lib/db/schema.ts",
// });
