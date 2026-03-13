/// <reference types="cypress" />

import type { LoginCreds, SignupCreds } from "@cypress/e2e/shared/auth-forms";
import {
	DASHBOARD_PATH,
	LOGIN_PATH,
	SIGNUP_PATH,
} from "@cypress/e2e/shared/paths";
import { UI_MATCHERS_REGEX } from "@cypress/e2e/shared/regex";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { TWENTY_SECONDS } from "@cypress/e2e/shared/times";

declare global {
	namespace Cypress {
		interface Chainable {
			dbReset(): Chainable<null>;
			dbResetAndSeed(): Chainable<null>;
			dbSeed(): Chainable<null>;
			logEnv(): Chainable<void>;
			login(creds: LoginCreds): Chainable<void>;
			loginAsDemoAdmin(): Chainable<void>;
			loginAsDemoUser(): Chainable<void>;
			logoutViaForm(): Chainable<void>;
			signup(creds: SignupCreds): Chainable<void>;
		}
	}
}

const assertOnDashboard = () => {
	cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
		"include",
		DASHBOARD_PATH,
	);
};

Cypress.Commands.add("dbReset", () => {
	return cy.task("db:reset") as Cypress.Chainable<null>;
});

Cypress.Commands.add("dbSeed", () => {
	return cy.task("db:seed") as Cypress.Chainable<null>;
});

Cypress.Commands.add("dbResetAndSeed", () => {
	return cy
		.task("db:reset")
		.then(() => cy.task("db:seed")) as Cypress.Chainable<null>;
});

Cypress.Commands.add("logEnv", () => {
	const env = Cypress.env();
	cy.log(`Cypress env: ${JSON.stringify(env, null, 2)}`);
});

Cypress.Commands.add("login", ({ email, password }: LoginCreds) => {
	cy.visit(LOGIN_PATH);

	cy.get(AUTH_SEL.loginEmail).type(email);
	cy.get(AUTH_SEL.loginPassword).type(password);
	cy.get(AUTH_SEL.loginSubmit).click();

	assertOnDashboard();
});

Cypress.Commands.add("signup", ({ username, email, password }: SignupCreds) => {
	cy.visit(SIGNUP_PATH);

	cy.get(AUTH_SEL.signupUsername).type(username);
	cy.get(AUTH_SEL.signupEmail).type(email);
	cy.get(AUTH_SEL.signupPassword).type(password);
	cy.get(AUTH_SEL.signupSubmit).click();

	assertOnDashboard();
});

Cypress.Commands.add("loginAsDemoUser", () => {
	cy.visit(LOGIN_PATH);
	cy.findByRole("button", {
		name: UI_MATCHERS_REGEX.loginDemoUserButton,
	}).click();

	assertOnDashboard();
});

Cypress.Commands.add("loginAsDemoAdmin", () => {
	cy.visit(LOGIN_PATH);
	cy.findByRole("button", {
		name: UI_MATCHERS_REGEX.loginDemoAdminButton,
	}).click();

	assertOnDashboard();
});

Cypress.Commands.add("logoutViaForm", () => {
	cy.visit(DASHBOARD_PATH);

	cy.location("pathname", { timeout: TWENTY_SECONDS }).then((pathname) => {
		if (pathname.includes(DASHBOARD_PATH)) {
			cy.findByRole("button", {
				name: UI_MATCHERS_REGEX.signoutButton,
			}).click();
		}
		cy.findByText(UI_MATCHERS_REGEX.welcomeHome, {
			timeout: TWENTY_SECONDS,
		}).should("be.visible");
	});
});
