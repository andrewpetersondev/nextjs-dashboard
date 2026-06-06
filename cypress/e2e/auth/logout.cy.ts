import { createTestUser } from "@cypress/e2e/shared/users";

describe("Logout via form", () => {
	it("signs up, then logs out via the sign-out button", () => {
		const user = createTestUser();
		cy.signup({
			email: user.email,
			password: user.password,
			username: user.username,
		});
		cy.logoutViaForm();
	});
});
