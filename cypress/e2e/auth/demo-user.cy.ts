import { ADMIN_DASHBOARD_H1, UI_MATCHERS } from "../__fixtures__/regex";

describe("Demo users login", () => {
  it("logs in as demo user via custom command", () => {
    cy.loginAsDemoUser();
    cy.findByRole("heading", { name: UI_MATCHERS.DASHBOARD_H1 }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).should(
      "be.visible",
    );
  });

  it("logs in as demo admin user via custom command", () => {
    cy.loginAsDemoAdmin();
    cy.findByRole("heading", { name: ADMIN_DASHBOARD_H1 }).should("be.visible");
    cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).should(
      "be.visible",
    );
  });
});
