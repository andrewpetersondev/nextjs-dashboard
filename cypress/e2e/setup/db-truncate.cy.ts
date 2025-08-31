const TRUNCATE_TIMEOUT = 60_000;

describe("Truncate test database", () => {
  it("removes all data from tables", () => {
    cy.task("db:truncate", null, { timeout: TRUNCATE_TIMEOUT });
  });
});
