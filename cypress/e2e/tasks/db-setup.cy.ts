import { createTestUser } from "../shared/users";

describe("task: db:setup", () => {
  it("creates or updates a user successfully", () => {
    const user = createTestUser();
    cy.task("db:setup", user).should("eq", null);
  });
});
