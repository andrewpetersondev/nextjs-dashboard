/**
 * @file db-prod.ts
 * @description
 * This file is used **only** for Drizzle Kit production operations (e.g., generating migrations, seeding the prod database).
 *
 * - Do **not** import or use this file in application runtime code.
 * - Uses environment variable `POSTGRES_URL_PRODDB` for the production database connection.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/overview
 */

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";

console.log("db-prod.ts ...");

let url: string;

if (process.env.POSTGRES_URL_PRODDB) {
  url = process.env.POSTGRES_URL_PRODDB;
} else {
  console.error("POSTGRES_URL_PRODDB is not set.");
  process.exit(1);
}

export const nodeEnvProdDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
