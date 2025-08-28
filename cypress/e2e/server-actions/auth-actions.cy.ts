import { ERROR_MESSAGES } from "../__fixtures__/messages-errors";
import { DASHBOARD_PATH, LOGIN_PATH, SIGNUP_PATH } from "../__fixtures__/paths";
import { STATUS_CODES } from "../__fixtures__/status-codes";
import { createTestUser } from "../__fixtures__/users";

describe("Authentication Server Actions", () => {
  it("should create user account via server action", () => {
    const user = createTestUser();

    cy.visit(SIGNUP_PATH);

    // todo: extract the signup form to custom command
    cy.get('[data-cy="signup-username-input"]').type(user.username);
    cy.get('[data-cy="signup-email-input"]').type(user.email);
    cy.get('[data-cy="signup-password-input"]').type(user.password);

    // Intercept the server action request
    cy.intercept("POST", "/_server-actions/**").as("signupAction");

    cy.get('[data-cy="signup-submit-button"]').click();

    cy.wait("@signupAction").then((interception) => {
      expect(interception.response?.statusCode).to.eq(STATUS_CODES.OK);
    });

    cy.url().should("include", DASHBOARD_PATH);
  });

  it("should handle login with invalid credentials", () => {
    cy.visit(LOGIN_PATH);
    cy.get('[data-cy="login-email-input"]').type("invalid@example.com");
    cy.get('[data-cy="login-password-input"]').type("wrongpassword");

    cy.intercept("POST", "/_server-actions/**").as("loginAction");

    cy.get('[data-cy="login-submit-button"]').click();

    cy.wait("@loginAction");
    cy.findByText(ERROR_MESSAGES.INVALID_CREDENTIALS).should("be.visible");
    cy.url().should("include", LOGIN_PATH);
  });
});
