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
import type { ImpactValue, Result } from "axe-core";

declare global {
	namespace Cypress {
		interface Chainable {
			checkA11yStrict(context?: string): Chainable<void>;
			dbReset(): Chainable<null>;
			dbResetAndSeed(): Chainable<null>;
			dbSeed(): Chainable<null>;
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

// The suite's single axe configuration: every landmark rule is moderate
// impact in axe-core, so a critical+serious filter would not guard the
// landmark structure at all. Minor stays excluded. Blocking by design —
// no skipFailures flag, violations FAIL the spec.
const A11Y_INCLUDED_IMPACTS: ImpactValue[] = [
	"critical",
	"serious",
	"moderate",
];

const logA11yViolations = (violations: Result[]): void => {
	for (const violation of violations) {
		cy.log(`A11y violation: ${violation.id}`);
		cy.log(`Description: ${violation.description}`);
		cy.log(`Help: ${violation.helpUrl}`);

		for (const node of violation.nodes) {
			cy.log(`Element: ${node.target.join(", ")}`);
			cy.log(`Summary: ${node.failureSummary}`);
		}
	}
};

// Call after cy.visit(); injects axe into the current page first.
Cypress.Commands.add("checkA11yStrict", (context?: string) => {
	cy.injectAxe();
	cy.checkA11y(
		context,
		{ includedImpacts: A11Y_INCLUDED_IMPACTS },
		logA11yViolations,
	);
});

Cypress.Commands.add("logoutViaForm", () => {
	cy.visit(DASHBOARD_PATH);

	cy.location("pathname", { timeout: TWENTY_SECONDS }).then((pathname) => {
		if (pathname.includes(DASHBOARD_PATH)) {
			cy.findByRole("button", {
				name: UI_MATCHERS_REGEX.signoutButton,
			}).click();
		}
		cy.findByText(UI_MATCHERS_REGEX.landingHeadline, {
			timeout: TWENTY_SECONDS,
		}).should("be.visible");
	});
});
