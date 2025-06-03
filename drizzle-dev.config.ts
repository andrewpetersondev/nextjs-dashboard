import "./envConfig";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

let url: string;

if (process.env.POSTGRES_URL) {
	console.log("drizzle-dev.config.ts ...");
	url = process.env.POSTGRES_URL;
	console.log("Using POSTGRES_URL from hcp vault", url);
} else {
	console.log("drizzle-dev.config.ts ...");
	console.log("POSTGRES_URL not found in hcp vault");
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
