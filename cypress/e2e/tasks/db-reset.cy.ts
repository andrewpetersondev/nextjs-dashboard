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
