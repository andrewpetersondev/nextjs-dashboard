import { TEST_USER_CREDENTIALS } from "../../support/types";

describe("Signup E2E", () => {
	beforeEach(() => {
		cy.deleteUser(TEST_USER_CREDENTIALS.email);
	});

	afterEach(() => {
		cy.deleteUser(TEST_USER_CREDENTIALS.email);
	});

	it("should sign up a new user via the UI", () => {
		cy.signup(TEST_USER_CREDENTIALS);
		cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard");
		cy.get("h1").contains("Dashboard", { timeout: 10000 }).should("be.visible");
	});
});
