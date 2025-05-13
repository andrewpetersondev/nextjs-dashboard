/// <reference types="../cypress.d.ts" />
/// <reference types="cypress" />

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session(
    email,
    () => {
      cy.visit("/login");
      cy.get('[data-cy="login-email-input"]').type(email);
      cy.get('[data-cy="login-password-input"]').type(password);
      cy.get('[data-cy="login-button"]').click();
      cy.url().should("include", "/dashboard");
      cy.get("h1").should("contain", "Dashboard");
    },
    {
      validate: () => {
        cy.getCookie("session").should("exist");
      },
      cacheAcrossSpecs: true,
    },
  );
});

type TestUser = {
  username: string;
  email: string;
  password: string;
};

Cypress.Commands.add("createTestUser", (user: TestUser) => {
  cy.task("db:seedUser", user).then((result) => {
    expect(result).to.eq("User created");
  });
});


Cypress.Commands.add("deleteTestUser", (email: string) => {
  cy.task("db:deleteUser", email).then((result) => {
    expect(result).to.eq("User deleted");
  });
});

// This file contains shared commands that can be used by both component and e2e tests
