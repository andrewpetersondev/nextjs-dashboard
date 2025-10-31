/**
 * @file node-db.ts
 * @description Singleton database connection for Node.js. Attempts to consolidate all database connections in one place.
 */

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";

console.log("node-db.ts ...");

// Ensure env is loaded by the process/runner before this import
const { DATABASE_URL } = await import("../config/env-cli");

console.log("Using DATABASE_URL:", DATABASE_URL);

let dbSingleton:
  | (NodePgDatabase & { readonly $client: NodePgClient })
  | undefined;

/**
 * Explicit factory if you want to override the connection string at call time.
 */
function createNodeDb(connectionString: string) {
  if (!connectionString) {
    throw new Error("createNodeDb: empty connection string");
  }
  return drizzle({
    casing: "snake_case",
    connection: connectionString,
  }) as NodePgDatabase & { readonly $client: NodePgClient };
}

/**
 * Lazy singleton based on DATABASE_URL from env-node.
 */
function getNodeDb() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!dbSingleton) {
    dbSingleton = createNodeDb(DATABASE_URL);
  }

  return dbSingleton;
}

// For convenience, default export is the singleton getter’s result
export const nodeDb = getNodeDb();
