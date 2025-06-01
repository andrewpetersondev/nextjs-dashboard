/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

describe("UI Login Tests @ /auth/login.cy.ts", () => {

  beforeEach(() => {
    cy.fixture("user").then((user) => {
      cy.deleteUser(user.email);
      cy.createUser(user);
    });
  });

  afterEach(() => {
    cy.fixture("user").then((user) => {
      cy.deleteUser(user.email);
    });
  });

  it("logs in successfully with valid credentials", () => {
    cy.fixture("user").then((user) => {
      cy.login(user, { assertSuccess: true });
    });
  });

  it("fails to login with invalid password", () => {
    cy.fixture("user").then((user) => {
      cy.login({ ...user, password: 'invalidpassword' });
      cy.get('[data-cy="login-message-errors"]').should('contain', 'Invalid email or password');
    });
  });

  it("fails to login with invalid email", () => {
    cy.fixture("user").then((user) => {
      cy.login({ ...user, email: 'invalidemail' });
      cy.get('[data-cy="login-email-input-errors"]').should('contain', 'Email address error');
    });
  });

  it("fails to login with non-existent email", () => {
    cy.fixture("user").then((user) => {
      cy.login({ ...user, email: 'nonexistent@mail.com' });
      cy.get('[data-cy="login-message-errors"]').should('contain', 'Invalid email or password');
    });
  });

});

