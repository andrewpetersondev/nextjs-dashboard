/**
 * Database connection (server-only).
 *
 * Purpose:
 * - Exposes a singleton Drizzle ORM instance typed with the application schema.
 * - Centralizes connection creation and config (naming/casing).
 *
 * Usage:
 * - Import getAppDb() in server code (actions, services, repositories).
 * - Do not import from client components.
 *
 * Environment:
 * - DATABASE_URL is resolved via the server env module.
 *
 * Notes:
 * - Connection is memoized to avoid multiple pool/clients in a single runtime.
 * - Uses snake_case casing to match table/column names.
 *
 * Shared application database connection factory using Drizzle ORM.
 *
 * Notes:
 * - Prefer this module in runtime code. Do not import dev-/test-database helpers.
 * - The database URL is resolved centrally in config/environment.ts.
 */

import "server-only";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "../config/env-next";
import type { schema as appSchema } from "./schema";

let appDbSingleton: AppDatabase | null = null;

/**
 * Strongly-typed application database bound to the shared schema.
 * Includes the underlying NodePgClient for advanced scenarios.
 */
export type AppDatabase = NodePgDatabase<typeof appSchema> & {
  readonly $client: NodePgClient;
};

/**
 * Returns the memoized application database instance.
 * Safe to call multiple times; always returns the same singleton.
 */
export function getAppDb(): AppDatabase {
  if (appDbSingleton) {
    return appDbSingleton;
  }

  appDbSingleton = drizzle({
    casing: "snake_case",
    connection: DATABASE_URL,
  }) satisfies AppDatabase;

  return appDbSingleton;
}
