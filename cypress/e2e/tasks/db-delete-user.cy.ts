import { createTestUser } from "../shared/users";

describe("task: db:deleteUser", () => {
  it("deletes an existing user (verified by db:userExists)", () => {
    const user = createTestUser();
    cy.task("db:deleteUser", user.email).then(() => {
      cy.task("db:createUser", user).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", true);
      cy.task("db:deleteUser", user.email).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", false);
    });
  });
});
