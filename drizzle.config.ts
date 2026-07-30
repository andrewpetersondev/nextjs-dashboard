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

// Fail fast on typos like DATABASE_ENV=prod: a silent fallback here would
// apply the dev migration set against whatever DATABASE_URL is loaded.
const scope: "dev" | "prod" | "test" | undefined = migrationScopeByEnv[env];

if (!scope) {
	throw new Error(
		`Unrecognized DATABASE_ENV/NODE_ENV "${env}" — expected one of: ${Object.keys(migrationScopeByEnv).join(", ")}.`,
	);
}

export default defineConfig({
	casing: "snake_case",
	dbCredentials: { url },
	dialect: "postgresql",
	out: `./drizzle/migrations/${scope}/`,
	schema: "./database/schema",
});
