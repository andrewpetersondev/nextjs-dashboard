/**
 * @file connection.ts
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
import type { schema } from "../../../node-only/schema";
import { DATABASE_URL } from "../config/env-next";

// Database instance type with strongly-typed schema
export type Database = NodePgDatabase<typeof schema> & {
  readonly $client: NodePgClient;
};

export function getDB(): Database {
  return drizzle({
    casing: "snake_case",
    connection: DATABASE_URL,
  }) as Database;
}
