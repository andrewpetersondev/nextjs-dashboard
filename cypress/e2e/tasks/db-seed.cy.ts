describe("task: db:seed", () => {
  it("seeds the database successfully", () => {
    cy.task("db:seed").should("eq", null);
  });
});
