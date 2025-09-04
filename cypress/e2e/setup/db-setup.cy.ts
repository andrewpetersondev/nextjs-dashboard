/// <reference types="cypress" />
import { buildE2EUser } from "../shared/db-test-constants";

describe("Database setup and cleanup tasks", () => {
  const testUser = buildE2EUser();
  const loginCreds = { email: testUser.email, password: testUser.password };

  beforeEach(function () {
    const url = Cypress.env("DATABASE_URL");
    if (!url) {
      console.warn("Skipping DB tasks tests; DATABASE_URL is not set");
      this.skip();
    }
    cy.logEnv();
    cy.log("DATABASE_URL:", url);
    cy.log("testUser:", testUser);
  });

  afterEach(() => {
    cy.task("db:cleanup");
  });

  it("db:setup seeds the exact user and db:userExists confirms it", () => {
    cy.task("db:setup", testUser);
    cy.task("db:userExists", testUser.email).should("be.true");
  });

  it("db:cleanup removes e2e_ users and db:userExists reflects removal", () => {
    cy.task("db:setup", testUser);
    cy.task("db:userExists", testUser.email).should("be.true");
    cy.task("db:cleanup");
    cy.task("db:userExists", testUser.email).should("be.false");
  });

  it("Happy path login works after db:setup", () => {
    cy.task("db:setup", testUser);
    cy.task("db:userExists", testUser.email).should("be.true");
    cy.login(loginCreds);
  });
});
