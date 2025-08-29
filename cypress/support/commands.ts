/// <reference types="cypress" />

import { UI_MATCHERS } from "../e2e/__fixtures__/constants";
import {
  DASHBOARD_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
} from "../e2e/__fixtures__/paths";
import { createTestUser } from "../e2e/__fixtures__/users";

/**
 * Credentials for signing up a user in E2E tests.
 * @public
 */
export type SignupCreds = {
  /** Desired username (display name). */
  username: string;
  /** User email address. */
  email: string;
  /** Plain-text password for test signup. */
  password: string;
};

declare global {
  // biome-ignore lint/style/noNamespace: <this is standard cypress>
  namespace Cypress {
    interface Chainable {
      /** Logs in using the login form */
      login(email: string, password: string): Chainable<void>;
      loginAsTestUser(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsRegularUser(): Chainable<void>;
      createTestItem(name: string): Chainable<void>;
      setupTestDatabase(): Chainable<void>;
      cleanupTestDatabase(): Chainable<void>;
      signup(creds: SignupCreds): Chainable<void>;
    }
  }
}

Cypress.Commands.add("setupTestDatabase", () => {
  cy.task("db:seed");
});

Cypress.Commands.add("cleanupTestDatabase", () => {
  cy.task("db:cleanup");
});

Cypress.Commands.add("loginAsTestUser", () => {
  const user = createTestUser();

  const SESSION_VERSION = "v1";
  cy.session([SESSION_VERSION, Cypress.config("baseUrl"), user.email], () => {
    // If a test DB is available, seed and log in. Otherwise, create the user via signup.
    const testDbUrl = Cypress.env("POSTGRES_URL_TESTDB");
    if (typeof testDbUrl === "string" && testDbUrl.length > 0) {
      cy.setupTestDatabase();

      cy.visit(LOGIN_PATH);
      cy.get('[data-cy="login-email-input"]').type(user.email);
      cy.get('[data-cy="login-password-input"]').type(user.password);
      cy.get('[data-cy="login-submit-button"]').click();
      cy.url().should("include", DASHBOARD_PATH);
    } else {
      // No DB seeding; ensure the user exists by signing up through the UI
      cy.signup({ username: user.username, email: user.email, password: user.password });
      cy.url().should("include", DASHBOARD_PATH);
    }
  });
});

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit(LOGIN_PATH);
  cy.get('[data-cy="login-email-input"]').clear().type(email);
  cy.get('[data-cy="login-password-input"]').clear().type(password);
  cy.get('[data-cy="login-submit-button"]').click();
});

Cypress.Commands.add("createTestItem", (name: string) => {
  cy.request({
    body: {
      description: `Description for ${name}`,
      name,
    },
    method: "POST",
    url: "/api/items",
  });
});

Cypress.Commands.add("signup", ({ username, email, password }: SignupCreds) => {
  cy.visit(SIGNUP_PATH);

  cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
    "be.visible",
  );

  cy.get('[data-cy="signup-username-input"]').type(username);
  cy.get('[data-cy="signup-email-input"]').type(email);
  cy.get('[data-cy="signup-password-input"]').type(password);

  // Submit and wait for client-side navigation to dashboard
  cy.get('[data-cy="signup-submit-button"]').click();
  cy.location("pathname", { timeout: 20000 }).should("include", DASHBOARD_PATH);
});
