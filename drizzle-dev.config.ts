import "./envConfig";
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
	casing: "snake_case",
	dbCredentials: {
		url: url,
	},
	dialect: "postgresql",
	out: "./src/db/drizzle/dev/",
	schema: "./src/db/schema.ts",
});
