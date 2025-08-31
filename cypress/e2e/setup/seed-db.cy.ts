describe("Seed test database (no cleanup)", () => {
  it("seeds minimal required data", () => {
    cy.task("db:seed");
  });

  // Optionally, seed a specific user you want to use in tests:
  // it("seeds a specific user", () => {
  //   cy.task("db:setup", { email: "admin@example.com", password: "Password123!" });
  // });
  // Note: db:setup does cleanup+seed. If you truly don't want cleanup, stick to db:seed.
});
