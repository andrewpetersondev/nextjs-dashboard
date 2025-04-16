/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// TODO: this file is not used
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
    },
  );
});

// Cypress.Commands.add("login2", (email: string, password: string) => {
//   cy.intercept({ method: "POST", url: "http://localhost:3000/login" }).as(
//     "loginRequest",
//   );
//   cy.get('[data-cy="login-email-input"]').type(email);
//   cy.get('[data-cy="login-password-input"]').type(password);
//   cy.get('[data-cy="login-button"]').click();
//   cy.wait("@loginRequest");
// });