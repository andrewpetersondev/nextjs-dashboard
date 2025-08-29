/// <reference types="cypress" />

import { UI_MATCHERS } from "../e2e/__fixtures__/constants";
import {
  DASHBOARD_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
} from "../e2e/__fixtures__/paths";
import { SEL } from "../e2e/__fixtures__/selectors";
import type { SignupCreds } from "../e2e/__fixtures__/types";
import { createTestUser } from "../e2e/__fixtures__/users";

declare global {
  // biome-ignore lint/style/noNamespace: <this is standard cypress>
  namespace Cypress {
    interface Chainable {
      /** Logs in using the login form */
      login(email: string, password: string): Chainable<void>;
      loginAsTestUser(): Chainable<void>;
      // loginAsAdmin(): Chainable<void>;
      // loginAsRegularUser(): Chainable<void>;
      createTestItem(name: string): Chainable<void>;
      setupTestDatabase(user?: SignupCreds): Chainable<void>;
      cleanupTestDatabase(): Chainable<void>;
      signup(creds: SignupCreds): Chainable<void>;
    }
  }
}

Cypress.Commands.add("setupTestDatabase", (user?: SignupCreds) => {
  // Ensure Cypress waits for task completion
  return cy.task("db:setup", user ?? null);
});

Cypress.Commands.add("cleanupTestDatabase", () => {
  // Ensure Cypress waits for task completion
  return cy.task("db:cleanup");
});

Cypress.Commands.add("loginAsTestUser", () => {
  const user = createTestUser();

  const SESSION_VERSION = "v1";
  cy.session([SESSION_VERSION, Cypress.config("baseUrl"), user.email], () => {
    // If a test DB is available, seed and log in. Otherwise, create the user via signup.
    const testDbUrl = Cypress.env("POSTGRES_URL_TESTDB");
    if (typeof testDbUrl === "string" && testDbUrl.length > 0) {
      // Setup now cleans and seeds the exact user
      cy.setupTestDatabase({
        email: user.email,
        password: user.password,
        username: user.username,
      });

      cy.visit(LOGIN_PATH);
      cy.get(SEL.loginEmail).clear().type(user.email);
      cy.get(SEL.loginPassword).clear().type(user.password, { log: false });
      cy.get(SEL.loginSubmit).click();
      cy.url().should("include", DASHBOARD_PATH);
    } else {
      // No DB seeding; ensure the user exists by signing up through the UI
      cy.signup({
        email: user.email,
        password: user.password,
        username: user.username,
      });
      cy.url().should("include", DASHBOARD_PATH);
    }
  });
});

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit(LOGIN_PATH);
  cy.get(SEL.loginEmail).clear().type(email);
  cy.get(SEL.loginPassword).clear().type(password, { log: false });
  cy.get(SEL.loginSubmit).click();
});

Cypress.Commands.add("signup", ({ username, email, password }: SignupCreds) => {
  cy.visit(SIGNUP_PATH);

  cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
    "be.visible",
  );

  cy.get(SEL.signupUsername).clear().type(username);
  cy.get(SEL.signupEmail).clear().type(email);
  cy.get(SEL.signupPassword).clear().type(password, { log: false });

  // Submit and wait for client-side navigation to dashboard
  cy.get(SEL.signupSubmit).click();
  cy.location("pathname", { timeout: 20_000 }).should(
    "include",
    DASHBOARD_PATH,
  );
});
