import {
	ERROR_MESSAGES_REGEX,
	INVALID_EMAIL,
	INVALID_PASSWORD,
} from "@cypress/e2e/shared/auth-forms";
import { DASHBOARD_PATH, LOGIN_PATH } from "@cypress/e2e/shared/paths";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";
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

	it("should handle login with invalid credentials", () => {
		cy.visit(LOGIN_PATH);
		cy.get(AUTH_SEL.loginEmail).type(INVALID_EMAIL);
		cy.get(AUTH_SEL.loginPassword).type(INVALID_PASSWORD);

		cy.get(AUTH_SEL.loginSubmit).click();

		// The unified invalid-credentials message renders in the AuthFormFeedback
		// banner AND as both field errors (no username enumeration), so target
		// the banner selector rather than findByText (which requires a unique match).
		cy.get(AUTH_SEL.authServerMessageError, { timeout: DEFAULT_TIMEOUT })
			.should("be.visible")
			.invoke("text")
			.should("match", ERROR_MESSAGES_REGEX.invalidCredentials);
		cy.url().should("include", LOGIN_PATH);
	});
});
