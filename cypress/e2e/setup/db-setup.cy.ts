/// <reference types="cypress" />

describe("Database setup and cleanup tasks", () => {
  const testUser = {
    email: `e2e_dbtest_${Date.now()}@example.com`,
    password: "P@ssw0rd!123",
    username: `e2e_user_${Date.now()}`,
  };

  before(function () {
    // Skip if test DB is not configured
    const url = Cypress.env("POSTGRES_URL_TESTDB");
    if (!url) {
      // eslint-disable-next-line no-console
      console.warn("Skipping DB tasks tests; POSTGRES_URL_TESTDB is not set");
      this.skip();
    }
  });

  it("db:setup seeds the exact user and db:userExists confirms it", () => {
    cy.task("db:setup", testUser);
    cy.task("db:userExists", testUser.email).should("equal", true);
  });

  it("db:cleanup removes e2e_ users and db:userExists reflects removal", () => {
    cy.task("db:setup", testUser); // ensure user is there
    cy.task("db:userExists", testUser.email).should("equal", true);
    cy.task("db:cleanup");
    cy.task("db:userExists", testUser.email).should("equal", false);
  });

  it("Happy path login works after db:setup", () => {
    cy.task("db:setup", testUser);
    // Using custom command if available, otherwise exercise login form:
    cy.login(testUser.email, testUser.password);
    cy.location("pathname", { timeout: 20000 }).should("include", "/dashboard");
  });
});
