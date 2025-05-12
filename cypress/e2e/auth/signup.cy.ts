/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

describe("Signup Tests", () => {
  beforeEach(() => {
    cy.visit("/signup");
  });

  it("registers successfully with valid credentials", () => {
    cy.get('[data-cy="signup-username-input"]').type("cypressuser")
    cy.get('[data-cy="signup-email-input"]').type("cypress@mail.com");
    cy.get('[data-cy="signup-password-input"]').type("Password123!");
    cy.get('[data-cy="signup-submit-button"]').click();
    cy.url().should("include", "/dashboard");
  });

  it("use fixture to register successfully", () => {
    cy.fixture("newuser.json").then((user) => {
      if (!user.email || !user.password) {
        throw new Error('Missing required user data in fixture')
      }
      cy.get('[data-cy="signup-email-input"]').type(user.email);
      cy.get('[data-cy="signup-password-input"]').type(user.password);
      cy.get('[data-cy="signup-submit-button"]').click();
      cy.url().should("include", "/dashboard");
    });
  });

  it("shows an error message for invalid email format", () => {
    cy.get('[data-cy="signup-email-input"]').type("invalidemail");
    cy.get('[data-cy="signup-password-input"]').type("Password123!");
    cy.get('[data-cy="signup-submit-button"]').click();
    cy.get('[data-cy="signup-email-errors"]')
      .should("be.visible")
      .and("contain", "Invalid email format");
  });

  it("shows an error message for invalid password format", () => {
    cy.get('[data-cy="signup-email-input"]').type("test@mail.com");
    cy.get('[data-cy="signup-password-input"]').type("weak");
    cy.get('[data-cy="signup-submit-button"]').click();
    cy.get('[data-cy="signup-password-errors"]')
      .should("be.visible")
      .and("contain", "Password must be at least 8 characters");
  });

  it("shows an error message when passwords don't match", () => {
    cy.get('[data-cy="signup-email-input"]').type("test@mail.com");
    cy.get('[data-cy="signup-password-input"]').type("Password123!");
    cy.get('[data-cy="signup-submit-button"]').click();
    cy.get('[data-cy="signup-password-errors"]')
      .should("be.visible")
      .and("contain", "Passwords do not match");
  });
});
