import {
  ERROR_MESSAGES_REGEX,
  INVALID_EMAIL,
  INVALID_PASSWORD,
} from "../shared/auth-forms";
import { DASHBOARD_PATH, LOGIN_PATH } from "../shared/paths";
import { AUTH_SEL } from "../shared/selectors";
import { createTestUser } from "../shared/users";

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
    cy.get(AUTH_SEL.loginEmail).type(INVALID_EMAIL);
    cy.get(AUTH_SEL.loginPassword).type(INVALID_PASSWORD);

    cy.get(AUTH_SEL.loginSubmit).click();

    // Assert error UI is shown, and we remain on login
    cy.findByText(ERROR_MESSAGES_REGEX.failedAuthForm).should("be.visible");
    cy.url().should("include", LOGIN_PATH);
  });
});
