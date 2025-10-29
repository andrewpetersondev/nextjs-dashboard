import { ADMIN_DASHBOARD_H1, UI_MATCHERS_REGEX } from "../shared/regex";

describe("Demo users login", () => {
  it("logs in as demo user via custom command", () => {
    cy.loginAsDemoUser();
    cy.findByRole("heading", { name: UI_MATCHERS_REGEX.dashboardH1 }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: UI_MATCHERS_REGEX.signoutButton }).should(
      "be.visible",
    );
  });

  it("logs in as demo admin user via custom command", () => {
    cy.loginAsDemoAdmin();
    cy.findByRole("heading", { name: ADMIN_DASHBOARD_H1 }).should("be.visible");
    cy.findByRole("button", { name: UI_MATCHERS_REGEX.signoutButton }).should(
      "be.visible",
    );
  });
});
