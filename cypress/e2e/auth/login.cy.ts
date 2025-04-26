/// <reference types="cypress" />

// describe("Login Tests", () => {
//   const loginUrl = "/login";
//   const dashboardUrl = "/dashboard";
//
//   beforeEach(() => {
//     cy.visit(loginUrl);
//   });
//
//   it("should login successfully using custom command", () => {
//     cy.login("test@mail.com", "Password123!");
//     cy.url().should("include", "/dashboard");
//   });
//
//   it("should login successfully with valid credentials", () => {
//     cy.intercept("POST", "/api/login", {
//       statusCode: 200,
//       body: {
//         success: true,
//         token: "fake-jwt-token",
//       },
//     }).as("loginRequest");
//
//     // Fill out the login form
//     cy.get('[data-cy="login-email-input"]').type("test@mail.com");
//     cy.get('[data-cy="login-password-input"]').type("Password123!");
//     cy.get('[data-cy="login-button"]').click();
//
//     // Wait for the login request and verify redirect
//     cy.wait("@loginRequest");
//     cy.url().should("include", dashboardUrl);
//   });
//
//   it("should display an error for invalid credentials", () => {
//     cy.intercept("POST", "/api/login", {
//       statusCode: 401,
//       body: {
//         success: false,
//         error: "Invalid email or password",
//       },
//     }).as("loginRequest");
//
//     // Fill out the login form with invalid credentials
//     cy.get('[data-cy="login-email-input"]').type("test@mail.com");
//     cy.get('[data-cy="login-password-input"]').type("Password123!");
//     cy.get('[data-cy="login-button"]').click();
//
//     // Wait for the login request and check for an error message
//     cy.wait("@loginRequest");
//     cy.get(".error-message")
//       .should("be.visible")
//       .and("contain", "Invalid email or password");
//   });
//
//   it("should show a validation error for missing email or password", () => {
//     cy.get('[data-cy="login-password-input"]').type("Wrongpassword1!");
//     cy.get('[data-cy="login-button"]').click();
//
//     // Ensure appropriate error message
//     cy.get(".error-message")
//       .should("be.visible")
//       .and("contain", "Email is required");
//
//     // Submit the form with missing password
//     cy.get('[data-cy="login-email-input"]').type("test@mail.com");
//     cy.get('[data-cy="login-password-input"]').clear();
//     cy.get('[data-cy="login-button"]').click();
//
//     // Ensure appropriate error message
//     cy.get('[data-cy="login-password-errors"]')
//       .should("be.visible")
//       .and("contain", "Password is required");
//   });
//
//   it("should prevent login when API is unavailable", () => {
//     // Simulate server error
//     cy.intercept("POST", "/api/login", {
//       statusCode: 500,
//       body: {
//         success: false,
//         error: "Internal server error",
//       },
//     }).as("loginRequest");
//
//     // Fill out the form
//     cy.get('[data-cy="login-email-input"]').type("test@mail.com");
//     cy.get('[data-cy="login-password-input"]').type("Password123!");
//     cy.get('[data-cy="login-button"]').click();
//
//     // Wait for the failure and validate the error message
//     cy.wait("@loginRequest");
//     cy.get(".error-message")
//       .should("be.visible")
//       .and("contain", "Something went wrong. Please try again later.");
//   });
// });

describe("Login Tests", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("logs in successfully with valid credentials", () => {
    cy.get('[data-cy="login-email-input"]').type("test@mail.com");
    cy.get('[data-cy="login-password-input"]').type("Password123!");
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/dashboard");
  });

  it("use fixture to log in successfully", () => {
    cy.fixture("user.json").then((user) => {
      expect(user.email).to.equal("testuser@mail.com");
      expect(user.password).to.equal("Password123!");
      cy.get('[data-cy="login-email-input"]').type(user.email);
      cy.get('[data-cy="login-password-input"]').type(user.password);
      cy.get('[data-cy="login-button"]').click();
      cy.url().should("include", "/dashboard");
    });
  });

  it("shows an error message for invalid email", () => {
    cy.get('[data-cy="login-email-input"]').type("invalid@mail.com");
    cy.get('[data-cy="login-password-input"]').type("Password123!");
    cy.get('[data-cy="login-button"]').click();
    // todo : implement a method based on the server response
    cy.wait(2000);
    cy.get('[data-cy="login-message-errors"]')
      .should("be.visible")
      .and("contain", "Invalid email or password");
  });

  it("shows an error message for invalid password", () => {
    cy.get('[data-cy="login-email-input"]').type("testuser@mail.com");
    cy.get('[data-cy="login-password-input"]').type("invalidpassword");
    cy.get('[data-cy="login-button"]').click();
    // todo : implement a method based on the server response
    cy.wait(2000);
    cy.get('[data-cy="login-message-errors"]')
      .should("be.visible")
      .and("contain", "Invalid email or password");
  });

  it("use custom command to login", () => {
    cy.clearLocalStorage();
    cy.fixture("user.json").then((user) => {
      cy.login(user.email, user.password);
    });
  });
});
