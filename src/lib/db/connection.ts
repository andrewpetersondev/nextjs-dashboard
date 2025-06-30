import "server-only";

import {
	drizzle,
	type NodePgClient,
	type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { POSTGRES_URL, POSTGRES_URL_TESTDB } from "@/src/config/env.ts";
// biome-ignore lint/performance/noNamespaceImport: ignore
import * as schema from "@/src/lib/db/schema.ts";

// Supported database types
export type DbType = "dev" | "test";

// Add this type for convenience
export type Db = NodePgDatabase<typeof schema> & {
	$client: NodePgClient;
};

/**
 * @deprecated
 * Map DbType to environment variable names
 */
const _DB_ENV_VARS: Record<DbType, string> = {
	dev: "POSTGRES_URL",
	test: "POSTGRES_URL_TESTDB",
};

const DB_URLS: Record<DbType, string> = {
	dev: POSTGRES_URL,
	test: POSTGRES_URL_TESTDB,
};

// Get the database URL from environment variables
function getDatabaseUrl(type: DbType): string {
	const url = DB_URLS[type];
	if (!url) {
		throw new Error(`Database URL for "${type}" is not set.`);
	}
	return url;
}

/**
 * Returns a Drizzle database instance for the specified environment.
 * @param type - "dev" (default) or "test"
 */

// biome-ignore lint/style/useNamingConvention: I like this name
export function getDB(type: DbType = "test"): Db {
	const url = getDatabaseUrl(type);
	return drizzle({ casing: "snake_case", connection: url, schema }) as Db;
}
