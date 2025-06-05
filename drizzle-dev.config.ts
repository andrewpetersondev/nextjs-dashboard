import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-dev.config.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
	url = process.env.POSTGRES_URL;
} else {
	console.error("POSTGRES_URL not found in hcp vault");
	process.exit(1);
}

export default defineConfig({
	out: "./src/db/drizzle/dev/",
	schema: "./src/db/schema.ts",
	casing: "snake_case",
	dialect: "postgresql",
	dbCredentials: {
		url: url,
	},
});
