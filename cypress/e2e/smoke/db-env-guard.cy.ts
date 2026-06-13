import type { DbEnvSummary } from "@cypress/node/tasks/db-env.task";

const EXPECTED_DATABASE_ENV = "test";
const EXPECTED_DATABASE_NAME = "test_db";

// Guards that the suite is pointed at the test database. The summary comes from
// the Node-side `db:env` task — DATABASE_URL / SESSION_SECRET never cross into
// browser-side Cypress.env(), so this spec reads neither.
describe("Smoke - test database environment guard", () => {
	it("runs against the test database", () => {
		cy.task<DbEnvSummary>("db:env").then((summary) => {
			expect(
				summary.databaseEnv,
				`DATABASE_ENV should equal "${EXPECTED_DATABASE_ENV}"`,
			).to.equal(EXPECTED_DATABASE_ENV);

			expect(
				summary.databaseName,
				`DATABASE_URL should point to "${EXPECTED_DATABASE_NAME}"`,
			).to.equal(EXPECTED_DATABASE_NAME);
		});
	});
});
