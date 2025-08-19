describe("Signup flow", () => {
  it("allows a new user to sign up and redirects to dashboard", () => {
    const ts = Date.now() % 99999999;
    const username = `e2e_user_${ts}`;
    const email = `e2e_${ts}@example.com`;
    const password = "P@ssw0rd!123"; // meets zod requirements: length, letter, number, special

    cy.visit("/signup");

    // Assert signup page renders
    cy.findByRole("heading", { name: /Sign up for an account/i }).should(
      "be.visible",
    );

    // Fill out the form
    cy.get('[data-cy="signup-username-input"]').type(username);
    cy.get('[data-cy="signup-email-input"]').type(email);
    cy.get('[data-cy="signup-password-input"]').type(password);

    // Optional: basic a11y check before submitting
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ["critical"] });

    // Submit the form
    cy.get('[data-cy="signup-submit-button"]').click();

    // Expect redirect to dashboard
    cy.url({ timeout: 20000 }).should("include", "/dashboard");

    // Verify dashboard heading for a regular user
    cy.findByRole("heading", { level: 1, name: /User Dashboard/i }).should(
      "be.visible",
    );
  });
});
