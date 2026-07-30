import {
	BASE_URL,
	DASHBOARD_PATH,
	LOGIN_PATH,
} from "@cypress/e2e/shared/paths";
import { UI_MATCHERS_REGEX } from "@cypress/e2e/shared/regex";
import { AUTH_SEL } from "@cypress/e2e/shared/selectors";
import { TWENTY_SECONDS } from "@cypress/e2e/shared/times";
import { EXTERNAL_URLS } from "@cypress/e2e/shared/urls";

describe("Home smoke test", () => {
	it("loads homepage and navigates to login", () => {
		cy.visit(BASE_URL);

		// Assert landing headline and GitHub source link exist
		cy.findByText(UI_MATCHERS_REGEX.landingHeadline).should("be.visible");
		cy.get(AUTH_SEL.githubRepoLink).should(
			"have.attr",
			"href",
			EXTERNAL_URLS.githubRepo,
		);

		// Navigate to the login page via the login button
		cy.get(AUTH_SEL.toLoginButton).click();
		cy.url().should("include", LOGIN_PATH);

		// Assert login page heading is visible
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.loginHeading }).should(
			"be.visible",
		);
	});

	it("opens the dashboard via the one-click demo", () => {
		cy.visit(BASE_URL);

		cy.get(AUTH_SEL.landingDemoButton).click();

		// Demo-user creation runs bcrypt + a DB transaction before redirecting,
		// so wait with the suite's extended timeout (same as assertOnDashboard).
		cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
			"include",
			DASHBOARD_PATH,
		);
		cy.findByRole("heading", { name: UI_MATCHERS_REGEX.dashboardH1 }).should(
			"be.visible",
		);
	});

	it("injects axe and checks for accessibility violations", () => {
		cy.visit(BASE_URL);

		// Detailed accessibility check with violation logging.
		// No skipFailures flag: critical/serious violations FAIL this spec.
		cy.injectAxe();
		cy.checkA11y(
			undefined,
			{
				includedImpacts: ["critical", "serious"],
			},
			(violations) => {
				// Log detailed violation information
				for (const violation of violations) {
					cy.log(`A11y violation: ${violation.id}`);
					cy.log(`Description: ${violation.description}`);
					cy.log(`Help: ${violation.helpUrl}`);

					for (const node of violation.nodes) {
						cy.log(`Element: ${node.target.join(", ")}`);
						cy.log(`Summary: ${node.failureSummary}`);
					}
				}
			},
		);
	});
});
