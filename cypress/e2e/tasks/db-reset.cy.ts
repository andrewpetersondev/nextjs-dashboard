describe("task: db:reset", () => {
  it("resets the database successfully", () => {
    cy.task("db:reset").should("eq", null);
  });
});
