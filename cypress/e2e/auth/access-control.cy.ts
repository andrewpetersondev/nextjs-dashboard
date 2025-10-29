import { DASHBOARD_PATH, LOGIN_PATH } from "../shared/paths";
import { UI_MATCHERS_REGEX } from "../shared/regex";

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

    // Visiting login should bounce to dashboard
    cy.url().should("include", DASHBOARD_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS_REGEX.dashboardH1 }).should(
      "be.visible",
    );
  });
});
