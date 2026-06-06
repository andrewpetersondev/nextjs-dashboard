import { DEMO_USER } from "@cypress/e2e/shared/users";

// Seeding has no HTTP route (unlike /api/db/reset); it runs as a Node task that
// calls the same databaseSeed() used by `pnpm db:seed`. Verify via db:userExists.
describe("task: db:seed", () => {
	it("seeds demo data after a reset (verified by db:userExists)", () => {
		cy.task("db:reset").then(() => {
			cy.task("db:userExists", DEMO_USER.email).should("eq", false);
			cy.task("db:seed").should("eq", null);
			cy.task("db:userExists", DEMO_USER.email).should("eq", true);
		});
	});
});
