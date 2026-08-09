import {
	CREATE_CUSTOMER_PATH,
	CUSTOMERS_PATH,
	DASHBOARD_PATH,
	DASHBOARD_USERS_PATH,
	INVOICES_PATH,
} from "@cypress/e2e/shared/paths";

/**
 * Dashboard accessibility smoke test.
 *
 * Guards the landmark structure of the authenticated shell: the layout owns
 * the single <main> (pages render inside it), the sidebar <nav> is the only
 * other landmark, and a skip link precedes both. Landmark rules are all
 * moderate impact in axe-core, which the shared strict command includes.
 */
describe("Dashboard accessibility smoke test", () => {
	before(() => {
		cy.dbResetAndSeed();
	});

	it("core dashboard pages have no axe violations", () => {
		cy.loginAsDemoAdmin();

		// Overview (landing target of the demo login).
		cy.checkA11yStrict();

		// Invoices list — class-bearing page wrapper, filter + table + pagination.
		cy.visit(INVOICES_PATH);
		cy.location("pathname").should("eq", INVOICES_PATH);
		cy.checkA11yStrict();

		// Admin-only users list.
		cy.visit(DASHBOARD_USERS_PATH);
		cy.location("pathname").should("eq", DASHBOARD_USERS_PATH);
		cy.checkA11yStrict();

		// Customers list — carries per-row icon-only action controls and an
		// initials avatar for any customer without an image, so it is the page
		// most exposed to name/contrast violations.
		cy.visit(CUSTOMERS_PATH);
		cy.location("pathname").should("eq", CUSTOMERS_PATH);
		cy.checkA11yStrict();

		// Customer create form — the only write form reachable by a non-admin.
		cy.visit(CREATE_CUSTOMER_PATH);
		cy.location("pathname").should("eq", CREATE_CUSTOMER_PATH);
		cy.checkA11yStrict();

		// Back to the overview path for completeness of the shell claim.
		cy.visit(DASHBOARD_PATH);
		cy.location("pathname").should("eq", DASHBOARD_PATH);
		cy.get("main#main-content").should("exist");
		cy.get("main").should("have.length", 1);
	});
});
