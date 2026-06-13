import { DATABASE_ENV, DATABASE_URL } from "@cypress/node/config/cypress-env";

/**
 * Non-secret summary of the test database environment.
 *
 * Specs use this to assert the suite is pointed at `test_db` without the
 * credential-bearing `DATABASE_URL` (or `SESSION_SECRET`) ever crossing into
 * browser-side `Cypress.env()`. The values are derived Node-side from the
 * already-validated env in `cypress-env.ts`.
 */
export type DbEnvSummary = {
	databaseEnv: string;
	databaseName: string;
};

/**
 * Build the safe DB-env summary. The database name is the last path segment of
 * `DATABASE_URL` (tolerant of leading/trailing slashes), never the full URL.
 */
export function dbEnvTask(): DbEnvSummary {
	const segments = new URL(DATABASE_URL).pathname.split("/").filter(Boolean);
	const databaseName = segments.at(-1) ?? "";
	return { databaseEnv: DATABASE_ENV, databaseName };
}
