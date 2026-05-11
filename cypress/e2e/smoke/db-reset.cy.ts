import { createTestUser, DEMO_USER } from "@cypress/e2e/shared/users";

describe("task: db:reset", () => {
	it("clears users (verified by db:userExists)", () => {
		const user = createTestUser();
		cy.task("db:deleteUser", user.email).then(() => {
			cy.task("db:userExists", user.email).should("eq", false);
			cy.task("db:createUser", user).should("eq", null);
			cy.task("db:userExists", user.email).should("eq", true);
			cy.task("db:reset").should("eq", null);
			cy.task("db:userExists", user.email).should("eq", false);
		});
	});
});

describe("Invoices", () => {
	const loginCreds = { email: DEMO_USER.email, password: DEMO_USER.password };

	before(() => {
		cy.dbReset();
		cy.dbSeed();
	});

	beforeEach(() => {
		cy.login(loginCreds);
	});

	it("shows seeded invoices", () => {
		cy.visit("/dashboard/invoices");
		cy.contains("Paid").should("exist");
	});
});
