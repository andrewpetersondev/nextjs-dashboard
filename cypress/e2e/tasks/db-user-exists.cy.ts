describe("task: db:userExists", () => {
  it("returns true when the user exists", () => {
    const email = `exists_${Date.now()}@example.com`;
    const user = {
      email,
      password: "Password123!",
      role: "user" as const,
      username: `user_${Date.now()}`,
    };

    cy.task("db:setup", user).should("eq", null);
    cy.task("db:userExists", email).should("eq", true);
    cy.task("db:deleteUser", email).should("eq", null);
  });
});
