import { createTestUser } from "../shared/users";

describe("task: db:cleanup", () => {
  it("cleans up E2E users successfully", () => {
    const user = createTestUser();
    cy.task("db:setup", user).should("eq", null);
    cy.task("db:cleanup").should("eq", null);
  });
});
