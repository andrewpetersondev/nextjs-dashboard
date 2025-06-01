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
      cy.login(user);
    });
  });
});

