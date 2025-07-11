import "server-only";

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { POSTGRES_URL, POSTGRES_URL_TESTDB } from "@/config/env";
import * as schema from "@/lib/db/schema";

// Supported database types
export type DbType = "dev" | "test";

// Add this type for convenience
export type Db = NodePgDatabase<typeof schema> & {
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
 * @param type - "dev" (default) or "test"
 */
export function getDB(type: DbType = "test"): Db {
  const url = getDatabaseUrl(type);
  return drizzle({ casing: "snake_case", connection: url, schema }) as Db;
}
