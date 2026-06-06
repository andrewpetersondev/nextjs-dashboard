import { createTestUser } from "@cypress/e2e/shared/users";

describe("task: db:setup", () => {
	const user = createTestUser();

	afterEach(() => {
		cy.task("db:cleanup");
	});

	it("upserts a user and it exists in DB", () => {
		cy.task("db:deleteUser", user.email).then(() => {
			cy.task("db:userExists", user.email).should("eq", false);
			cy.task("db:setup", user).should("eq", null);
			cy.task("db:userExists", user.email).should("eq", true);
		});
	});
});
