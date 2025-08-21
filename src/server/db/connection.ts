/**
 * @file connection.ts
 * Shared application database connection factory using Drizzle ORM.
 *
 * Notes:
 * - Prefer this module in runtime code. Do not import dev-/test-database helpers.
 * - Defaults DB selection from NODE_ENV: "test" -> test DB, "development" -> dev DB, "production" -> prod DB.
 * - See src/config/README.md and src/config/env.ts for environment variable details.
 */
import "server-only";

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import {
  POSTGRES_URL,
  POSTGRES_URL_PRODDB,
  POSTGRES_URL_TESTDB,
} from "@/config/environment";
import * as schema from "@/server/db/schema";

// Supported database types
type DbType = "development" | "test" | "production";

// Database instance type with strongly-typed schema
export type Database = NodePgDatabase<typeof schema> & {
  $client: NodePgClient;
};

/**
 * Normalize NODE_ENV to our DbType domain.
 * - Accepts "development" | "production" | "test"
 * - Treats any other value as "development" for safety.
 */
function resolveDbTypeFromNodeEnv(env: string): DbType {
  switch (env) {
    case "test":
      return "test";
    case "production":
      return "production";
    case "development":
      return "development";
    default:
      return "development";
  }
}

// Get the database URL from environment variables
function getDatabaseUrl(type: DbType): string {
  if (type !== "production" && type !== "development" && type !== "test") {
    throw new Error(
      `Invalid database type: ${type}. Must be one of "production", "development", or "test".`,
    );
  }

  if (type === "production") {
    if (!POSTGRES_URL_PRODDB) {
      throw new Error(
        'Database URL for "production" is not set. Ensure POSTGRES_URL_PRODDB is available when running in production.',
      );
    }
    return POSTGRES_URL_PRODDB;
  }

  if (type === "development") {
    return POSTGRES_URL;
  }
  // type === "test"
  if (!POSTGRES_URL_TESTDB) {
    throw new Error(
      'Database URL for "test" is not set. Ensure POSTGRES_URL_TESTDB is available when running tests.',
    );
  }
  return POSTGRES_URL_TESTDB;
}

/**
 * Returns a Drizzle database instance for the specified environment.
 * Defaults based on NODE_ENV:
 * - "test"        -> test DB (POSTGRES_URL_TESTDB)
 * - "development" -> dev DB (POSTGRES_URL)
 * - "production"  -> prod DB (POSTGRES_URL_PRODDB)
 */
export function getDB(
  type: DbType = resolveDbTypeFromNodeEnv(process.env.NODE_ENV),
): Database {
  const url = getDatabaseUrl(type);
  return drizzle({ casing: "snake_case", connection: url, schema }) as Database;
}
