import { UI_MATCHERS } from "../__fixtures__/constants";
import { DASHBOARD_PATH, LOGIN_PATH, SIGNUP_PATH } from "../__fixtures__/paths";
import { createTestUser } from "../__fixtures__/users";

describe("Signup → Sign out → Login flow", () => {
  it("allows a user to sign up, sign out, and then log back in", () => {
    const user = createTestUser();

    // 1) Sign up
    cy.visit(SIGNUP_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
      "be.visible",
    );

    cy.get('[data-cy="signup-username-input"]').type(user.username);
    cy.get('[data-cy="signup-email-input"]').type(user.email);
    cy.get('[data-cy="signup-password-input"]').type(user.password);

    cy.get('[data-cy="signup-submit-button"]').click();

    // 2) Redirects to dashboard after signup
    cy.url({ timeout: 20000 }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");

    // 3) Sign out from dashboard (Logout button has aria-label "Sign Out")
    cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).click();

    // 4) After logout, redirected to home
    cy.findByText(UI_MATCHERS.WELCOME_HOME, { timeout: 20000 }).should(
      "be.visible",
    );

    // 5) Go to login and login with the same credentials
    cy.get('[data-testid="login-button"]').click();
    cy.url().should("include", LOGIN_PATH);

    cy.get('[data-cy="login-email-input"]').type(user.email);
    cy.get('[data-cy="login-password-input"]').type(user.password);
    cy.get('[data-cy="login-submit-button"]').click();

    // 6) Back on dashboard after login
    cy.url({ timeout: 20000 }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
