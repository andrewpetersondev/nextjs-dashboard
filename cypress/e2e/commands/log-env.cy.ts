const DbRegex = /\/test_db\/?$/;

describe("Custom Command to Log Env Variables", () => {
  it("logs env variables", () => {
    cy.logEnv();

    cy.then(() => {
      const { DATABASE_URL, SESSION_SECRET, DATABASE_ENV } = Cypress.env();

      // Basic presence checks
      expect(DATABASE_URL, "DATABASE_URL should be set").to.be.a("string").and
        .not.be.empty;
      expect(SESSION_SECRET, "SESSION_SECRET should be set").to.be.a("string")
        .and.not.be.empty;
      expect(DATABASE_ENV, "DATABASE_ENV should be set").to.be.a("string").and
        .not.be.empty;

      // DATABASE_URL should be a valid URL
      expect(
        () => new URL(String(DATABASE_URL)),
        "DATABASE_URL should be a valid URL",
      ).not.to.throw();

      // DATABASE_ENV must be exactly "test"
      expect(String(DATABASE_ENV), 'DATABASE_ENV should equal "test"').to.equal(
        "test",
      );

      // DATABASE_URL should point to a database named "test_db"
      const url = new URL(String(DATABASE_URL));
      const path = url.pathname; // e.g., "/test_db" or "/test_db/"
      expect(path, 'DATABASE_URL path should end with "/test_db"').to.match(
        DbRegex,
      );
    });
  });
});
