import "server-only";

import {
	drizzle,
	type NodePgClient,
	type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import * as schema from "@/src/db/schema";

// Supported database types
export type DBType = "dev" | "test";

// Add this type for convenience
export type DB = NodePgDatabase<typeof schema> & {
	$client: NodePgClient;
};

// Map DBType to environment variable names
const DB_ENV_VARS: Record<DBType, string> = {
	dev: "POSTGRES_URL",
	test: "POSTGRES_URL_TESTDB",
};

// Get the database URL from environment variables
function getDatabaseUrl(type: DBType): string {
	const envVar = DB_ENV_VARS[type];
	const url = process.env[envVar];
	if (!url) {
		throw new Error(
			`Database URL for "${type}" is not set. Expected env: ${envVar}`,
		);
	}
	return url;
}

/**
 * Returns a Drizzle database instance for the specified environment.
 * @param type - "dev" (default) or "test"
 */
export function getDB(type: DBType = "dev"): DB {
	const url = getDatabaseUrl(type);
	return drizzle({ casing: "snake_case", connection: url, schema }) as DB;
}
