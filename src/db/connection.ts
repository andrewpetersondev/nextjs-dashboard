/**
 * @file connection.ts
 * Shared application database connection factory using Drizzle ORM.
 *
 * Notes:
 * - Prefer this module in runtime code. Do not import dev-/test-database helpers.
 * - Default environment is "test" to align with the project's current setup.
 * - See src/config/README.md and src/config/env.ts for environment variable details.
 */
import "server-only";

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { POSTGRES_URL, POSTGRES_URL_TESTDB } from "@/config/env";
import * as schema from "@/db/schema";

// Supported database types
type DbType = "dev" | "test";

// Database instance type with strongly-typed schema
export type Database = NodePgDatabase<typeof schema> & {
  $client: NodePgClient;
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
 * @param type - "test" (default) or "dev"
 */
export function getDB(type: DbType = "test"): Database {
  const url = getDatabaseUrl(type);
  return drizzle({ casing: "snake_case", connection: url, schema }) as Database;
}
