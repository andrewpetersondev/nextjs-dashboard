describe("task: db:setup", () => {
  it("creates or updates a user successfully", () => {
    const email = `setup_${Date.now()}@example.com`;
    const user = {
      email,
      password: "Password123!",
      role: "user" as const,
      username: `user_${Date.now()}`,
    };

    cy.task("db:setup", user).should("eq", null);

    // Optionally, clean up created user to keep DB tidy
    cy.task("db:deleteUser", email).should("eq", null);
  });
});
