import {
	DASHBOARD_PATH,
	LOGIN_PATH,
	SIGNUP_PATH,
} from "@cypress/e2e/shared/paths";
import { UI_MATCHERS_REGEX } from "@cypress/e2e/shared/regex";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";
import { createTestUser } from "@cypress/e2e/shared/users";

describe("Signup flow", () => {
	it("allows a new user to sign up and redirects to dashboard", () => {
		const user = createTestUser();

		cy.visit(SIGNUP_PATH);

		// Assert signup page renders
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.signupHeading }).should(
			"be.visible",
		);

		// Fill out the form
		cy.get(AUTH_SEL.signupUsername).type(user.username);
		cy.get(AUTH_SEL.signupEmail).type(user.email);
		cy.get(AUTH_SEL.signupPassword).type(user.password);

		// Optional: basic a11y check before submitting
		cy.injectAxe();
		cy.checkA11y(undefined, { includedImpacts: ["critical"] }, undefined, true);

		// Submit the form
		cy.get(AUTH_SEL.signupSubmit).click();

		// Expect redirect to dashboard
		cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);

		// Verify dashboard heading for a regular user
		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");
	});
});

describe("Signup flow with Database Tasks", () => {
	// beforeEach(() => {
	// Ensure clean test database state
	// });

	// Avoid after() with tasks to prevent failures on runner teardown.
	// afterEach(() => {
	// Best-effort cleanup after each test in this suite
	// });

	it("allows a new user to sign up and redirects to dashboard", () => {
		const user = createTestUser();

		cy.visit(SIGNUP_PATH);
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.signupHeading }).should(
			"be.visible",
		);

		cy.get(AUTH_SEL.signupUsername).type(user.username);
		cy.get(AUTH_SEL.signupEmail).type(user.email);
		cy.get(AUTH_SEL.signupPassword).type(user.password);

		cy.get(AUTH_SEL.signupSubmit).click();
		cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);

		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");
	});
});

describe("Signup → Sign out → Login flow", () => {
	const user = createTestUser();

	beforeEach(function () {
		const url = Cypress.env("DATABASE_URL");
		if (!url) {
			console.warn("Skipping DB tasks tests; DATABASE_URL is not set");
			this.skip();
		}
		cy.logEnv();
		cy.log("DATABASE_URL:", url);
		cy.log("user:", user);
	});

	it("allows a user to sign up, sign out, and then log back in", () => {
		// 1) Sign up
		cy.signup({
			email: user.email,
			password: user.password,
			username: user.username,
		});

		// 2) Redirects to dashboard after signup
		cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");

		// 3) Sign out from the dashboard (Logout button has aria-label "Sign Out")
		cy.findByRole("button", {
			name: UI_MATCHERS_REGEX.signoutButton,
		}).click();

		// 4) After logout, redirected to home
		cy.findByText(UI_MATCHERS_REGEX.welcomeHome, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");

		// 5) Go to the login and login with the same credentials
		cy.get(AUTH_SEL.toLoginButton).click();
		cy.url().should("include", LOGIN_PATH);

		cy.get(AUTH_SEL.loginEmail).type(user.email);
		cy.get(AUTH_SEL.loginPassword).type(user.password);
		cy.get(AUTH_SEL.loginSubmit).click();

		// 6) Back on dashboard after login
		cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");
	});
});

describe("Signup → Sign out → Login flow", () => {
	it("allows a user to sign up, sign out, and then log back in", () => {
		const user = createTestUser();

		// 1) Sign up
		cy.visit(SIGNUP_PATH);
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.signupHeading }).should(
			"be.visible",
		);

		cy.get(AUTH_SEL.signupUsername).type(user.username);
		cy.get(AUTH_SEL.signupEmail).type(user.email);
		cy.get(AUTH_SEL.signupPassword).type(user.password);

		cy.get(AUTH_SEL.signupSubmit).click();

		// 2) Redirects to dashboard after signup
		cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");

		// 3) Sign out from the dashboard (Logout button has aria-label "Sign Out")
		cy.findByRole("button", {
			name: UI_MATCHERS_REGEX.signoutButton,
		}).click();

		// 4) After logout, redirected home
		cy.findByText(UI_MATCHERS_REGEX.welcomeHome, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");

		// 5) Go to the login and login with the same credentials
		cy.get(AUTH_SEL.toLoginButton).click();
		cy.url().should("include", LOGIN_PATH);

		cy.get(AUTH_SEL.loginEmail).type(user.email);
		cy.get(AUTH_SEL.loginPassword).type(user.password);
		cy.get(AUTH_SEL.loginSubmit).click();

		// 6) Back on dashboard after login
		cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
		cy.findByRole("heading", {
			level: 1,
			name: UI_MATCHERS_REGEX.dashboardH1,
		}).should("be.visible");
	});
});
