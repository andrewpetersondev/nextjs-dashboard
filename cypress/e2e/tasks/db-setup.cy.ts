import { createTestUser } from "../shared/users";

describe("task: db:setup", () => {
  it("upserts a user and it exists in DB", () => {
    const user = createTestUser();
    cy.task("db:deleteUser", user.email).then(() => {
      cy.task("db:userExists", user.email).should("eq", false);
      cy.task("db:setup", user).should("eq", null);
      cy.task("db:userExists", user.email).should("eq", true);
    });
  });
});
