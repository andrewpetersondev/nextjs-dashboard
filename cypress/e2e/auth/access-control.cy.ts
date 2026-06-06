import {
	DASHBOARD_PATH,
	DASHBOARD_USERS_PATH,
	LOGIN_PATH,
} from "@cypress/e2e/shared/paths";
import { UI_MATCHERS_REGEX } from "@cypress/e2e/shared/regex";

describe("Access control", () => {
	it("redirects unauthenticated user from dashboard to login", () => {
		cy.clearCookies();
		cy.visit(DASHBOARD_PATH, { failOnStatusCode: false });
		cy.url().should("include", LOGIN_PATH);
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.loginHeading }).should(
			"be.visible",
		);
	});

	it("redirects authenticated user away from login to dashboard", () => {
		cy.loginAsDemoUser();

		// Visiting login while authenticated should bounce to dashboard
		cy.visit(LOGIN_PATH);
		cy.url().should("include", DASHBOARD_PATH);
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.dashboardH1 }).should(
			"be.visible",
		);
	});

	it("lets a demo admin reach the admin-only users page", () => {
		cy.loginAsDemoAdmin();
		cy.visit(DASHBOARD_USERS_PATH);
		cy.location("pathname").should("eq", DASHBOARD_USERS_PATH);
	});

	it("redirects a non-admin user away from the admin-only users page", () => {
		cy.loginAsDemoUser();
		cy.visit(DASHBOARD_USERS_PATH);
		cy.location("pathname").should("eq", DASHBOARD_PATH);
	});
});
