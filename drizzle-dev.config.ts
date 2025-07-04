import "./envConfig.ts";
import { defineConfig } from "drizzle-kit";
import { POSTGRES_URL } from "./src/config/env.ts";

console.log("drizzle-dev.config.ts ...");

export default defineConfig({
	casing: "snake_case",
	dbCredentials: {
		url: POSTGRES_URL,
	},
	dialect: "postgresql",
	out: "./src/lib/db/drizzle/dev/",
	schema: "./src/lib/db/schema.ts",
});

// export const drizzleDevConfig = defineConfig({
// 	casing: "snake_case",
// 	dbCredentials: {
// 		url: POSTGRES_URL,
// 	},
// 	dialect: "postgresql",
// 	out: "./src/lib/db/drizzle/dev/",
// 	schema: "./src/lib/db/schema.ts",
// });
