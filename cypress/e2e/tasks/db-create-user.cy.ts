import { createTestUser } from "../shared/users";

describe("task: db:createUser", () => {
  it("creates a user and it exists in DB", () => {
    const user = createTestUser();
    cy.task("db:deleteUser", user.email).then(() => {
      cy.task("db:userExists", user.email).should("eq", false);
      cy.task("db:createUser", user).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", true);
    });
  });
});
