/// <reference types="cypress" />

// This file contains shared commands that can be used by both component and e2e tests

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
