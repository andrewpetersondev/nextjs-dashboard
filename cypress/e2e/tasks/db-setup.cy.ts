import { createTestUser } from "../shared/users";

describe("task: db:setup", () => {
  const user = createTestUser();
  const loginCreds = { email: user.email, password: user.password };

  before(() => {
    cy.logEnv();
  });

  beforeEach(() => {
    cy.log("user", user);
  });

  afterEach(() => {
    cy.task("db:cleanup");
  });

  it("upserts a user and it exists in DB", () => {
    cy.task("db:deleteUser", user.email).then(() => {
      cy.task("db:userExists", user.email).should("eq", false);
      cy.task("db:setup", user).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", true);
    });
  });

  it("db:setup seeds the exact user and db:userExists confirms it", () => {
    cy.task("db:setup", user);
    cy.task("db:userExists", user.email).should("be.true");
  });

  it("db:cleanup removes e2e_ users and db:userExists reflects removal", () => {
    cy.task("db:setup", user);
    cy.task("db:userExists", user.email).should("be.true");
    cy.task("db:cleanup");
    cy.task("db:userExists", user.email).should("be.false");
  });

  it("Happy path login works after db:setup", () => {
    cy.task("db:setup", user);
    cy.task("db:userExists", user.email).should("be.true");
    cy.login(loginCreds);
  });
});
