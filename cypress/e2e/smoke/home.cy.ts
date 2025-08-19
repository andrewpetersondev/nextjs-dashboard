describe("Home smoke test", () => {
  it("loads homepage and navigates to login", () => {
    cy.visit("/");

    // Assert welcome text and course link exist
    cy.findByText(/Welcome to Acme\./i).should("be.visible");
    cy.get('[data-testid="nextjs-course-link"]').should(
      "have.attr",
      "href",
      "https://nextjs.org/learn/",
    );

    // Navigate to login page via the login button
    cy.get('[data-testid="login-button"]').click();
    cy.url().should("include", "/login");

    // Assert login page heading is visible
    cy.findByRole("heading", { name: /Log in to your account/i }).should(
      "be.visible",
    );

    // Optional: basic accessibility check on login page
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ["critical", "serious"] });
  });
});
