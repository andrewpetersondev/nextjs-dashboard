import { createTestUser } from "../shared/users";

describe("task: db:reset", () => {
  it("clears users (verified by db:userExists)", () => {
    const user = createTestUser();
    cy.task("db:deleteUser", user.email).then(() => {
      cy.task("db:userExists", user.email).should("eq", false);
      cy.task("db:createUser", user).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", true);
      cy.task("db:reset").should("eq", null);
      cy.task("db:userExists", user.email).should("eq", false);
    });
  });
});

// TypeScript
describe("Invoices", () => {
  const user = createTestUser();

  before(() => {
    // You can also use cy.dbResetAndSeed() if you prefer one call:
    // cy.dbResetAndSeed();
    cy.dbReset();
    cy.dbSeed();
  });

  beforeEach(() => {
    // If you rely on session caching:
    // cy.session("login", () => { cy.loginProgrammatically(); });
    // Or just log in
    cy.login(user);
  });

  it("shows seeded invoices", () => {
    cy.visit("/dashboard/invoices");
    cy.contains("Paid").should("exist");
  });
});
