import { createTestUser } from "../shared/users";

describe("task: db:setup", () => {
  it("creates or updates a user successfully", () => {
    const user = createTestUser();

    cy.task("db:setup", user).should("eq", null);

    // Optionally, clean up created user to keep DB tidy
    // cy.task("db:deleteUser", user.email).should("eq", null);
  });
});
