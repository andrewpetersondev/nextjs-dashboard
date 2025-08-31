/// <reference types="cypress" />
import { buildE2EUser } from "../../support/db-test-constants";

describe("Database setup and cleanup tasks", () => {
  const testUser = buildE2EUser();

  before(function () {
    // Skip if test DB is not configured
    const url = Cypress.env("POSTGRES_URL_TESTDB");
    if (!url) {
      console.warn("Skipping DB tasks tests; POSTGRES_URL_TESTDB is not set");
      this.skip();
    }
  });

  afterEach(() => {
    // Ensure we don't leak test users across specs
    cy.task("db:cleanup");
  });

  it("db:setup seeds the exact user and db:userExists confirms it", () => {
    cy.task("db:setup", testUser);
    cy.task("db:userExists", testUser.email).should("be.true");
  });

  it("db:cleanup removes e2e_ users and db:userExists reflects removal", () => {
    cy.task("db:setup", testUser); // ensure user is there
    cy.task("db:userExists", testUser.email).should("be.true");
    cy.task("db:cleanup");
    cy.task("db:userExists", testUser.email).should("be.false");
  });

  it("Happy path login works after db:setup", () => {
    cy.task("db:setup", testUser);
    cy.log("Before cy.login");
    cy.log("POSTGRES_URL_TESTDB:", Cypress.env("POSTGRES_URL_TESTDB"));
    cy.log("testUser:", testUser);
    // Ensure the seeded user is present before attempting UI login:
    cy.task("db:userExists", testUser.email).should("be.true");
    // Using custom command which already asserts navigation to dashboard:
    cy.login(testUser.email, testUser.password);
    cy.log("After cy.login");
  });
});
