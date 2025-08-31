/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */
/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */

/**
 * @file reset-dev.ts
 * @description
 * Resets all tables in the development database using Drizzle Seed.
 *
 * - Intended for CLI tooling and Cypress only.
 * - Do **not** import or use in application runtime code.
 * - Do **not** import "server-only" code.
 * - This file MAY need to include file extensions like .ts for compatibility with the CLI tools and Cypress.
 * - This file MAY need to use RELATIVE IMPORTS for compatibility with the CLI tools and Cypress.
 * - Uses the dev database connection from `db-dev.ts`.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/seed
 */

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { reset } from "drizzle-seed";
import * as schema from "../src/server/db/schema";

console.log("db-dev.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
  url = process.env.POSTGRES_URL;
} else {
  console.error("POSTGRES_URL is not set.");
  process.exit(1);
}

const nodeEnvDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });

async function main(): Promise<void> {
  await reset(nodeEnvDb, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
  .then((): void => {
    console.log("drizzle reset complete, tables remain, but values are gone");
  })
  .catch((error) => {
    console.error("Error resetting Dev Database:", error);
  });
