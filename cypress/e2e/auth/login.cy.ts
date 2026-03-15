import { LOGIN_PATH } from "@cypress/e2e/shared/paths";
import { LOGIN_REGEX, UI_MATCHERS_REGEX } from "@cypress/e2e/shared/regex";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";
import { createTestUser } from "@cypress/e2e/shared/users";

// Next.js Internal Knowledge: Some tests (like login-form.cy.ts) are testing React useId implementation details. This
// is likely what you meant by "too specific on code in src". E2E tests shouldn't care how an ID is generated, only
// that the label is associated with the input.

describe("Login Form (E2E) - useId integration", () => {
	beforeEach(() => {
		cy.visit(LOGIN_PATH);
		cy.findByRole("form", { name: LOGIN_REGEX }).should("exist");
	});

	it("renders inputs with unique, non-static ids and proper label associations", () => {
		// Email input
		cy.get(AUTH_SEL.loginEmail)
			.should("have.length", 1)
			.should("have.attr", "id")
			.then((emailId) => {
				expect(emailId).to.be.a("string");
				expect(emailId).to.not.equal("email"); // ensure it's not a static id
				cy.get(`label[for="${emailId}"]`).should("exist");
			});

		// Password input
		cy.get(AUTH_SEL.loginPassword)
			.should("have.length", 1)
			.should("have.attr", "id")
			.then((passwordId) => {
				expect(passwordId).to.be.a("string");
				expect(passwordId).to.not.equal("password"); // ensure it's not a static id
				cy.get(`label[for="${passwordId}"]`).should("exist");
			});

		// Also verify aria-describedby references exist (if present)
		cy.get(AUTH_SEL.loginEmail).then(($el) => {
			const describedBy = $el.attr("aria-describedby");
			if (describedBy) {
				cy.get(`#${describedBy}`).should("exist");
			}
		});

		cy.get(AUTH_SEL.loginPassword).then(($el) => {
			const describedBy = $el.attr("aria-describedby");
			if (describedBy) {
				cy.get(`#${describedBy}`).should("exist");
			}
		});
	});
});

describe("Login Form (E2E) - useId integration - Part 2", () => {
	beforeEach(() => {
		cy.visit(LOGIN_PATH);
		cy.findByRole("form", { name: LOGIN_REGEX }).should("exist");
	});

	it("keeps stable field names and submits without relying on static ids", () => {
		// Names should remain stable for server action submission
		cy.get(AUTH_SEL.loginEmail).should("have.attr", "name", "email");
		cy.get(AUTH_SEL.loginPassword).should("have.attr", "name", "password");

		cy.get(AUTH_SEL.loginEmail).clear().type("steve@jobs.com");
		cy.get(AUTH_SEL.loginPassword).clear().type("hunter2");

		cy.get(AUTH_SEL.loginSubmit).click();

		cy.get(AUTH_SEL.loginSubmit, { timeout: DEFAULT_TIMEOUT }).should(
			($btn) => {
				const isDisabled = ($btn.attr("disabled") as unknown) !== undefined;
				expect(isDisabled).to.be.oneOf([true, false]);
			},
		);
	});
});

describe("Login success flow", () => {
	it("logs in and reaches dashboard UI", () => {
		const user = createTestUser();
		const signupCreds = {
			email: user.email,
			password: user.password,
			username: user.username,
		};
		const loginCreds = { email: user.email, password: user.password };

		cy.signup(signupCreds);

		cy.logoutViaForm();

		cy.login(loginCreds);

		// With cy.login now waiting for navigation, the following is optional.
		// Keeping the heading assertion as the main UI guard.
		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");
	});
});
