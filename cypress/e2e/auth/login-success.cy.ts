import { DEFAULT_TIMEOUT, UI_MATCHERS } from "../__fixtures__/constants";
import { DASHBOARD_PATH, LOGIN_PATH } from "../__fixtures__/paths";
import { createTestUser } from "../__fixtures__/users";

describe("Login success flow", () => {
  it("logs in and reaches dashboard UI", () => {
    const user = createTestUser();

    // Ensure the user exists through the signup path if needed
    // Attempt signup first for determinism in ephemeral DBs
    cy.signup({
      username: user.username,
      email: user.email,
      password: user.password,
    });

    // Now sign out to test the login success path
    cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).click();

    cy.visit(LOGIN_PATH);
    cy.get('[data-cy="login-email-input"]').type(user.email);
    cy.get('[data-cy="login-password-input"]').type(user.password);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
