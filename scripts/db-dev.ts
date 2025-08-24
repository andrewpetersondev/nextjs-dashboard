/**
 * @file db-dev.ts
 * @description
 * This file is used **only** for Drizzle Kit development operations (e.g., generating migrations, seeding the dev database).
 *
 * - Do **not** import or use this file in application runtime code.
 * - Uses environment variable `POSTGRES_URL` for the dev database connection.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/overview
 */

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";

console.log("db-dev.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
  url = process.env.POSTGRES_URL;
} else {
  console.error("POSTGRES_URL is not set.");
  process.exit(1);
}

export const nodeEnvDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
