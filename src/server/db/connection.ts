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
import { accounts } from "../../../node-only/schema/accounts";
import { customers } from "../../../node-only/schema/customers";
import { demoUserCounters } from "../../../node-only/schema/demo-users";
import { invoices } from "../../../node-only/schema/invoices";
import { revenues } from "../../../node-only/schema/revenues";
import { sessions } from "../../../node-only/schema/sessions";
import { users } from "../../../node-only/schema/users";
import { DATABASE_URL } from "../config/env-next";

const schema = {
  accounts,
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};

// Database instance type with strongly-typed schema
export type Database = NodePgDatabase<typeof schema> & {
  $client: NodePgClient;
};

/**
 * Returns a Drizzle database instance using the resolved DATABASE_URL.
 * The resolution logic prefers DATABASE_URL and falls back to legacy variables
 * based on DATABASE_ENV inside the environment module.
 */
export function getDB(): Database {
  return drizzle({
    casing: "snake_case",
    connection: DATABASE_URL,
    schema,
  }) as Database;
}
