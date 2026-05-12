import process from "node:process";
import { defineConfig } from "drizzle-kit";

const url: string | undefined = process.env.DATABASE_URL;

if (!url) {
	throw new Error("DATABASE_URL is not set.");
}

const env: string = (
	process.env.DATABASE_ENV ??
	process.env.NODE_ENV ??
	"development"
).toLowerCase();

const migrationScopeByEnv: Record<string, "dev" | "prod" | "test"> = {
	development: "dev",
	production: "prod",
	test: "test",
};

const scope = migrationScopeByEnv[env] ?? "dev";

export default defineConfig({
	casing: "snake_case",
	dbCredentials: { url },
	dialect: "postgresql",
	out: `./drizzle/migrations/${scope}/`,
	schema: "./database/schema",
});
