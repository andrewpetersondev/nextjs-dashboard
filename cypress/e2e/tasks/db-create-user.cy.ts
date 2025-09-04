describe("task: db:createUser", () => {
  it("creates a user successfully", () => {
    const email = `create_${Date.now()}@example.com`;
    const user = {
      email,
      password: "Password123!",
      role: "user" as const,
      username: `user_${Date.now()}`,
    };

    cy.task("db:createUser", user).should("eq", null);
    // cleanup
    cy.task("db:deleteUser", email).should("eq", null);
  });
});
