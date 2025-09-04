import { createTestUser } from "../shared/users";

describe("task: db:userExists", () => {
  it("returns true when the user exists", () => {
    const user = createTestUser();
    cy.task("db:setup", user).should("eq", null);
    cy.task("db:userExists", user.email).should("eq", true);
    // cy.task("db:deleteUser", user.email).should("eq", null);
  });
});
