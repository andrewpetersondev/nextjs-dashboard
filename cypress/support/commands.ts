/// <reference types="cypress" />

import { UI_MATCHERS } from "../e2e/__fixtures__/constants";
import { SIGNUP_PATH } from "../e2e/__fixtures__/paths";
import { createTestUser } from "../e2e/__fixtures__/users";

type SignupCreds = {
  username: string;
  email: string;
  password: string;
};

declare global {
  // biome-ignore lint/style/noNamespace: <this is standard cypress>
  namespace Cypress {
    interface Chainable {
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

  cy.session([user.email], () => {
    // Ensure test database is seeded
    cy.setupTestDatabase();

    cy.visit("/login");
    cy.get('[data-cy="login-email-input"]').type(user.email);
    cy.get('[data-cy="login-password-input"]').type(user.password);
    cy.get('[data-cy="login-submit-button"]').click();
    cy.url().should("include", "/dashboard");
  });
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

  cy.get('[data-cy="signup-submit-button"]').click();
});
