describe("task: db:cleanup", () => {
  it("cleans up E2E users successfully", () => {
    cy.task("db:cleanup").should("eq", null);
  });
});
