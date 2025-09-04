import { DASHBOARD_USERS_PATH } from "../shared/paths";

describe("Login as Demo Admin", () => {
  it("visits a path restricted to Admins", () => {
    cy.loginAsDemoAdmin();
    // visit the user page
    cy.visit(DASHBOARD_USERS_PATH);
    cy.location("pathname").should("eq", DASHBOARD_USERS_PATH);
  });
});
