import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log("drizzle-dev.config.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
	url = process.env.POSTGRES_URL;
	console.log("Using POSTGRES_URL from .env");
} else {
	console.log("drizzle-dev.config.ts ...");
	console.log("postgres url not found in .env");
	process.exit(1);
}
export default defineConfig({
	out: "./src/db/drizzle/dev/",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: url,
	},
});
