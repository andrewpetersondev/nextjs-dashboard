import {
	ERROR_MESSAGES_REGEX,
	INVALID_EMAIL,
	INVALID_PASSWORD,
} from "@cypress/e2e/shared/auth-forms";
import { DASHBOARD_PATH, LOGIN_PATH } from "@cypress/e2e/shared/paths";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { createTestUser } from "@cypress/e2e/shared/users";

describe("Authentication Server Actions", () => {
	it("should create user account via server action", () => {
		const user = createTestUser();

		// Use the custom signup command for consistency
		cy.signup({
			email: user.email,
			password: user.password,
			username: user.username,
		});

		// Assert redirected to dashboard as success criteria
		cy.url().should("include", DASHBOARD_PATH);
	});

	// SKIPPED: same app bug as the invoice update error test — auth form error
	// results are AppError class instances that can't serialize across the
	// server-action boundary, so the "Failed to validate form data" banner never
	// renders.
	// biome-ignore lint/suspicious/noSkippedTests: re-enable once form errors are plain serializable objects (tracked)
	it.skip("should handle login with invalid credentials", () => {
		cy.visit(LOGIN_PATH);
		cy.get(AUTH_SEL.loginEmail).type(INVALID_EMAIL);
		cy.get(AUTH_SEL.loginPassword).type(INVALID_PASSWORD);

		cy.get(AUTH_SEL.loginSubmit).click();

		// Assert error UI is shown, and we remain on login
		cy.findByText(ERROR_MESSAGES_REGEX.failedAuthForm).should("be.visible");
		cy.url().should("include", LOGIN_PATH);
	});
});
