/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */
/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */

/**
 * @file reset-test.ts
 * @description
 * Resets all tables in the test database using Drizzle Seed.
 *
 * - Intended for CLI tooling and Cypress only.
 * - Do **not** import or use in application runtime code.
 * - Do **not** import "server-only" code.
 * - This file MAY need to include file extensions like .ts for compatibility with the CLI tools and Cypress.
 * - This file MAY need to use RELATIVE IMPORTS for compatibility with the CLI tools and Cypress.
 * - Uses the test database connection from `db-test.ts`.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/seed
 */

import dotenv from "dotenv";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { reset } from "drizzle-seed";
import * as schema from "@/server/db/schema";

dotenv.config({ path: ".env.test" });

console.log("db-test.ts ...");

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
  url = process.env.POSTGRES_URL_TESTDB;
  console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
  console.error("POSTGRES_URL_TESTDB is not set.");
  process.exit(1);
}

const nodeEnvTestDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });

async function main(): Promise<void> {
  await reset(nodeEnvTestDb, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
  .then((): void => {
    console.log("drizzle reset complete, tables remain, but values are gone");
  })
  .catch((error) => {
    console.error("Error resetting test Database:", error);
  });
