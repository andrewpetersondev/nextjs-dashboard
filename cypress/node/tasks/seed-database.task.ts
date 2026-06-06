import { databaseSeed } from "@devtools/seed/seed.task";

/**
 * Seed the database with demo customers, invoices, and users.
 *
 * Delegates to the same `databaseSeed()` used by `pnpm db:seed`, so the Cypress
 * task and the CLI stay in sync. `databaseSeed` only proceeds when the database
 * is empty (see `ensureResetOrEmpty`), so reset first — e.g. `cy.dbResetAndSeed()`.
 */
export async function seedDatabaseTask(): Promise<void> {
	await databaseSeed();
}
