describe("Signup → Sign out → Login flow", () => {
  it("allows a user to sign up, sign out, and then log back in", () => {
    const ts = Date.now() % 99999999;
    const username = `e2e_user_${ts}`;
    const email = `e2e_${ts}@example.com`;
    const password = "P@ssw0rd!123"; // meets zod requirements

    // 1) Sign up
    cy.visit("/signup");
    cy.findByRole("heading", { name: /Sign up for an account/i }).should(
      "be.visible",
    );

    cy.get('[data-cy="signup-username-input"]').type(username);
    cy.get('[data-cy="signup-email-input"]').type(email);
    cy.get('[data-cy="signup-password-input"]').type(password);

    cy.get('[data-cy="signup-submit-button"]').click();

    // 2) Redirects to dashboard after signup
    cy.url({ timeout: 20000 }).should("include", "/dashboard");
    cy.findByRole("heading", { name: /User Dashboard/i, level: 1 }).should(
      "be.visible",
    );

    // 3) Sign out from dashboard (Logout button has aria-label "Sign Out")
    cy.findByRole("button", { name: /Sign Out/i }).click();

    // 4) After logout, redirected to home
    cy.findByText(/Welcome to Acme\./i, { timeout: 20000 }).should(
      "be.visible",
    );

    // 5) Go to login and login with the same credentials
    cy.get('[data-testid="login-button"]').click();
    cy.url().should("include", "/login");

    cy.get('[data-cy="login-email-input"]').type(email);
    cy.get('[data-cy="login-password-input"]').type(password);
    cy.get('[data-cy="login-submit-button"]').click();

    // 6) Back on dashboard after login
    cy.url({ timeout: 20000 }).should("include", "/dashboard");
    cy.findByRole("heading", { name: /User Dashboard/i, level: 1 }).should(
      "be.visible",
    );
  });
});
