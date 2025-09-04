describe("task: db:seed", () => {
  it("seeds demo users (verified by db:userExists)", () => {
    cy.task("db:reset").then(() => {
      cy.task("db:userExists", "user@user.com").should("eq", false);
      cy.task("db:seed").should("eq", null);
      cy.task("db:userExists", "user@user.com").should("eq", true);
    });
  });
});
