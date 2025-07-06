import "./envConfig.ts";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-dev.config.ts ...");

export default defineConfig({
	casing: "snake_case",
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
	},
	dialect: "postgresql",
	out: "./src/lib/db/drizzle/dev/",
	schema: "./src/lib/db/schema.ts",
});
