/// <reference types="cypress" />

import React from "react";
import LoginFormV2 from "@/src/ui/login-form-v2";

describe("Login Form", () => {
  beforeEach(() => {
    cy.mount(<LoginFormV2 />);
  });

  it("should render the component correctly", () => {
    cy.contains("Sign in to your account").should("exist");
    cy.get('[data-cy="login-email-input"]').should("exist");
    cy.get('[data-cy="login-password-input"]').should("exist");
    cy.get('button[type="submit"]').should("exist");
  });

  // it('should require email and password fields', () => {
  //   // Try to submit without filling inputs
  //   cy.get('button[type="submit"]').click();
  //
  //   // Check for error messages
  //   cy.get('[data-cy="login-email-errors"]').should('exist');
  //   cy.get('[data-cy="login-password-errors"]').should('exist');
  // });

  // it('should display errors when invalid email is entered', () => {
  //   // Input an invalid email
  //   cy.get('[data-cy="login-email-input"]').type('invalid-email');
  //   cy.get('[data-cy="login-password-input"]').type('validPassword123');
  //
  //   // Submit the form
  //   cy.get('button[type="submit"]').click();
  //
  //   // Verify email error message
  //   cy.get('[data-cy="login-email-errors"]').should('exist');
  // });

  // it('should validate secure password rules', () => {
  //   // Input a valid email but invalid password
  //   cy.get('[data-cy="login-email-input"]').type('user@example.com');
  //   cy.get('[data-cy="login-password-input"]').type('123'); // Assuming this is invalid
  //
  //   // Submit the form
  //   cy.get('button[type="submit"]').click();
  //
  //   // Check for password validation errors
  //   cy.get('[data-cy="login-password-errors"]').should('exist');
  // });

  // it('should allow login with valid credentials', () => {
  //   // Input valid email and password
  //   cy.get('[data-cy="login-email-input"]').type('user@example.com');
  //   cy.get('[data-cy="login-password-input"]').type('ValidPassword123');
  //
  //   // Submit the form
  //   cy.get('button[type="submit"]').click();
  //
  //   // Check for no validation error messages
  //   cy.get('[data-cy="login-email-errors"]').should('not.exist');
  //   cy.get('[data-cy="login-password-errors"]').should('not.exist');
  //
  //   // Verify the submit action (mock the login action if needed)
  //   cy.url().should('not.include', '/login'); // Example of redirection
  // });
});
