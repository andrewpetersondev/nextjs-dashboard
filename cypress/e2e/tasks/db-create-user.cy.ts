import { createTestUser } from "../shared/users";

describe("task: db:createUser", () => {
  it("creates a user successfully", () => {
    const user = createTestUser();
    cy.task("db:createUser", user).should("eq", null);
  });
});
