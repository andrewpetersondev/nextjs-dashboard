import { createTestUser } from "../shared/users";

describe("task: db:deleteUser", () => {
  it("deletes a user successfully", () => {
    const user = createTestUser();
    cy.task("db:createUser", user).should("eq", null);
    cy.task("db:deleteUser", user.email).should("eq", null);
  });
});
