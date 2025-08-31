import { DASHBOARD_PATH, LOGIN_PATH } from "../__fixtures__/paths";
import { UI_MATCHERS } from "../__fixtures__/regex";

describe("Access control", () => {
  it("redirects unauthenticated user from dashboard to login", () => {
    cy.clearCookies();
    cy.visit(DASHBOARD_PATH, { failOnStatusCode: false });
    cy.url().should("include", LOGIN_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS.LOGIN_HEADING }).should(
      "be.visible",
    );
  });

  it("redirects authenticated user away from login to dashboard", () => {
    // use existing helper to create a logged-in session
    cy.loginAsTestUser();

    // Visiting login should bounce to dashboard
    cy.visit(LOGIN_PATH);
    cy.url().should("include", DASHBOARD_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS.DASHBOARD_H1 }).should(
      "be.visible",
    );
  });
});
