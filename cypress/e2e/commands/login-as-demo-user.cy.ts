import { DASHBOARD_PATH, DASHBOARD_USERS_PATH } from "../shared/paths";

describe("Login as Demo User", () => {
  it("visits a path restricted to Admins", () => {
    cy.loginAsDemoUser();
    // visit the user page
    cy.visit(DASHBOARD_USERS_PATH);
    cy.location("pathname").should("eq", DASHBOARD_PATH);
  });
});
