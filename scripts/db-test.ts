/**
 * @file db-test.ts
 * @description
 * This file is used **only** for Drizzle Kit test operations (e.g., generating test migrations, seeding the test database).
 *
 * - Do **not** import or use this file in application runtime code.
 * - Active test database: "test_db" (connected via `POSTGRES_URL_TESTDB`).
 * - Uses environment variable `POSTGRES_URL_TESTDB` for the test database connection.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/overview
 */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/style/noProcessEnv: <temp> */

import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";

console.log("db-test.ts ...");

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
  url = process.env.POSTGRES_URL_TESTDB;
  console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
  console.error("POSTGRES_URL_TESTDB is not set.");
  process.exit(1);
}

export const nodeEnvTestDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
