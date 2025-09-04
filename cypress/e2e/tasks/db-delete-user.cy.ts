describe("task: db:deleteUser", () => {
  it("deletes a user successfully", () => {
    const email = `delete_${Date.now()}@example.com`;
    const user = {
      email,
      password: "Password123!",
      role: "user" as const,
      username: `user_${Date.now()}`,
    };

    // Ensure user exists first
    cy.task("db:createUser", user).should("eq", null);

    // Then delete
    cy.task("db:deleteUser", email).should("eq", null);
  });
});
