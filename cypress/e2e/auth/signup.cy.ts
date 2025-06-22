import { TEST_USER_CREDENTIALS } from "../../support/types";

describe("Signup E2E", () => {
	beforeEach(() => {
		cy.deleteUser(TEST_USER_CREDENTIALS.email);
	});

	// FAILS:  AssertionError: Timed out retrying after 4000ms: expected '<title>' to be 'visible'
	it("should sign up a new user via the UI", () => {
		cy.signup(TEST_USER_CREDENTIALS);
		cy.url().should("include", "/dashboard");
		cy.contains("Dashboard").should("be.visible");
	});
});
