import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from "@cypress/e2e/shared/paths";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { DEMO_USER } from "@cypress/e2e/shared/users";

/**
 * Generic confirmation copy — must match FORGOT_PASSWORD_CONFIRMATION in
 * src/modules/auth/presentation/constants/auth.tokens.ts. Deliberately
 * duplicated here so a copy change is a conscious contract change.
 */
const CONFIRMATION_TEXT =
	"If an account exists for that email, we've sent a password reset link.";

const FORGOT_PASSWORD_LINK_REGEX = /forgot password/i;

function submitResetRequest(email: string): void {
	cy.visit(FORGOT_PASSWORD_PATH);
	cy.get(AUTH_SEL.forgotPasswordForm).should("exist");
	cy.get(AUTH_SEL.forgotPasswordEmail).type(email);
	cy.get(AUTH_SEL.forgotPasswordSubmit).click();
}

describe("Forgot password request (E2E)", () => {
	it("is reachable from the login page link", () => {
		cy.visit(LOGIN_PATH);
		cy.contains("a", FORGOT_PASSWORD_LINK_REGEX).click();
		cy.location("pathname").should("eq", FORGOT_PASSWORD_PATH);
		cy.get(AUTH_SEL.forgotPasswordForm).should("exist");
	});

	it("replaces the form with the generic confirmation and demo note", () => {
		submitResetRequest("no-such-account@example.com");

		cy.get(AUTH_SEL.authServerMessageSuccess).should(
			"contain.text",
			CONFIRMATION_TEXT,
		);
		cy.get(AUTH_SEL.forgotPasswordDemoNote).should("be.visible");
		cy.get(AUTH_SEL.forgotPasswordForm).should("not.exist");
	});

	// ADR 006: a registered email must produce the same response as an
	// unknown one, so the endpoint cannot be used to probe which accounts
	// exist. DEMO_USER is the seeded account; the previous test used an
	// unknown address — both must land on the identical confirmation.
	it("shows the identical confirmation for a registered email (ADR 006)", () => {
		submitResetRequest(DEMO_USER.email);

		cy.get(AUTH_SEL.authServerMessageSuccess).should(
			"contain.text",
			CONFIRMATION_TEXT,
		);
		cy.get(AUTH_SEL.forgotPasswordDemoNote).should("be.visible");
		cy.get(AUTH_SEL.forgotPasswordForm).should("not.exist");
	});
});
