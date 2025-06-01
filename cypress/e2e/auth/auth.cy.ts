/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

describe('Auth Commands via UI', () => {

  beforeEach(() => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
    });
  });

  afterEach(() => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
    });
  });

  it('should signup a new user', () => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
      cy.signup(user);
    });
  });

  it('should login with created user', () => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
      cy.login(user);
    });
  });
});

describe("Auth Commands via Tasks", () => {
  beforeEach(() => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
    });
  });

  afterEach(() => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
    });
  });

  it('should create a test user via db:insert', () => {
    cy.fixture("user").then((user) => {
      cy.createTestUser(user);
    });
  });

  it('should delete a test user via db:delete', () => {
    cy.fixture("user").then((user) => {
      cy.deleteTestUser(user.email);
    });
  });
});
