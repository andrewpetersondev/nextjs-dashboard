/**
 * @file reset-prod.ts
 * @description
 * Resets all tables in the development database using Drizzle Seed.
 *
 * - Intended for CLI tooling and Cypress only.
 * - Do **not** import or use in application runtime code.
 * - Do **not** import "server-only" code.
 * - This file MAY need to include file extensions like .ts for compatibility with the CLI tools and Cypress.
 * - This file MAY need to use RELATIVE IMPORTS for compatibility with the CLI tools and Cypress.
 * - Uses the dev database connection from `dev-database.ts`.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/seed
 */

import { reset } from "drizzle-seed";
import * as schema from "@/server/db/schema";
import { nodeEnvProdDb } from "./prod-database";

async function main(): Promise<void> {
  await reset(nodeEnvProdDb, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
  .then((): void => {
    console.log("drizzle reset complete, tables remain, but values are gone");
  })
  .catch((error) => {
    console.error("Error resetting Dev Database:", error);
  });
