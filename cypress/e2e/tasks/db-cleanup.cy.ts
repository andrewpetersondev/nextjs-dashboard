import { createTestUser } from "../shared/users";

describe("task: db:cleanup", () => {
  it("removes e2e_ users (verified by db:userExists)", () => {
    const user = createTestUser();
    cy.task("db:deleteUser", user.email).then(() => {
      cy.task("db:userExists", user.email).should("eq", false);
      cy.task("db:setup", user).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", true);
      cy.task("db:cleanup").should("eq", null);
      cy.task("db:userExists", user.email).should("eq", false);
    });
  });
});
