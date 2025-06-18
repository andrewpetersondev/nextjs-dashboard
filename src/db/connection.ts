import "server-only";

import * as schema from "@/src/db/schema";
import {
	type NodePgClient,
	type NodePgDatabase,
	drizzle,
} from "drizzle-orm/node-postgres";

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
	return drizzle({ connection: url, casing: "snake_case", schema }) as DB;
}
