/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

describe("Signup Tests", () => {
  beforeEach(() => {
    cy.fixture("user").then((user) => {
      // Use DB task for fast, reliable cleanup
      cy.task("db:deleteUser", user.email);
    });
  });

  afterEach(() => {
    cy.fixture("user").then((user) => {
      cy.task("db:deleteUser", user.email);
    });
  });

  it("registers successfully with valid credentials", () => {
    cy.fixture("user").then((user) => {
      cy.signup(user);
    });
  });
});
