/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

describe("Signup Tests", () => {
  const signupUrl = "/signup";
  const dashboardUrl = "/dashboard";
  const testUser = {
    username: "testuser",
    email: "testuser@mail.com",
    password: "Password123!",
  };

  beforeEach(() => {
    cy.visit(signupUrl);
  });

  afterEach(() => {
    cy.task("logToConsole", "Deleting test user...");
    cy.task("db:delete", testUser.email).then((result) => {
      cy.task("logToConsole", result);
    });
  });

  it("registers successfully with valid credentials", () => {
    cy.get('[data-cy="signup-username-input"]').type(testUser.username);
    cy.get('[data-cy="signup-email-input"]').type(testUser.email);
    cy.get('[data-cy="signup-password-input"]').type(testUser.password);
    cy.get('[data-cy="signup-submit-button"]').click();
    cy.url().should("include", dashboardUrl);
  });

  // it("use fixture to register successfully", () => {
  //   cy.fixture("newuser.json").then((user) => {
  //     if (!user.email || !user.password) {
  //       throw new Error('Missing required user data in fixture')
  //     }
  //     cy.get('[data-cy="signup-email-input"]').type(user.email);
  //     cy.get('[data-cy="signup-password-input"]').type(user.password);
  //     cy.get('[data-cy="signup-submit-button"]').click();
  //     cy.url().should("include", dashboardUrl);
  //   });
  // });

  // it("shows an error message for invalid email format", () => {
  //   cy.get('[data-cy="signup-email-input"]').type("invalidemail");
  //   cy.get('[data-cy="signup-password-input"]').type("Password123!");
  //   cy.get('[data-cy="signup-submit-button"]').click();
  //   cy.get('[data-cy="signup-email-errors"]')
  //     .should("be.visible")
  //     .and("contain", "Invalid email format");
  // });

  // it("shows an error message for invalid password format", () => {
  //   cy.get('[data-cy="signup-email-input"]').type("test@mail.com");
  //   cy.get('[data-cy="signup-password-input"]').type("weak");
  //   cy.get('[data-cy="signup-submit-button"]').click();
  //   cy.get('[data-cy="signup-password-errors"]')
  //     .should("be.visible")
  //     .and("contain", "Password must be at least 8 characters");
  // });

  // it("shows an error message when passwords don't match", () => {
  //   cy.get('[data-cy="signup-email-input"]').type("test@mail.com");
  //   cy.get('[data-cy="signup-password-input"]').type("Password123!");
  //   cy.get('[data-cy="signup-submit-button"]').click();
  //   cy.get('[data-cy="signup-password-errors"]')
  //     .should("be.visible")
  //     .and("contain", "Passwords do not match");
  // });
});
