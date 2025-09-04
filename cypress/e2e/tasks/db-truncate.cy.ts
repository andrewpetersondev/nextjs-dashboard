describe("task: db:truncate", () => {
  it("truncates the database successfully", () => {
    cy.task("db:truncate").should("eq", null);
  });
});
