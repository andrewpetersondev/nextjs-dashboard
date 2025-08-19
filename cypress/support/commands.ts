// cypress/support/commands.ts
import { createTestUser } from "../e2e/__fixtures__/users";

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsTestUser(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsRegularUser(): Chainable<void>;
      createTestItem(name: string): Chainable<void>;
      setupTestDatabase(): Chainable<void>;
      cleanupTestDatabase(): Chainable<void>;
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
