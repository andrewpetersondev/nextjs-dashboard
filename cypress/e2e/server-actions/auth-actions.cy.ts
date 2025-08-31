import { ERROR_MESSAGES } from "../__fixtures__/messages-errors";
import { DASHBOARD_PATH, LOGIN_PATH } from "../__fixtures__/paths";
import { createTestUser } from "../__fixtures__/users";

describe("Authentication Server Actions", () => {
  it("should create user account via server action", () => {
    const user = createTestUser();

    // Use the custom signup command for consistency
    cy.signup({
      email: user.email,
      password: user.password,
      username: user.username,
    });

    // Assert redirected to dashboard as success criteria
    cy.url().should("include", DASHBOARD_PATH);
  });

  it("should handle login with invalid credentials", () => {
    cy.visit(LOGIN_PATH);
    cy.get('[data-cy="login-email-input"]').type("invalid@example.com");
    cy.get('[data-cy="login-password-input"]').type("wrongpassword");

    cy.get('[data-cy="login-submit-button"]').click();

    // Assert error UI is shown and we remain on login
    cy.findByText(ERROR_MESSAGES.INVALID_CREDENTIALS).should("be.visible");
    cy.url().should("include", LOGIN_PATH);
  });
});
