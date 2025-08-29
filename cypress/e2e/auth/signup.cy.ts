import { DEFAULT_TIMEOUT, UI_MATCHERS } from "../__fixtures__/constants";
import { DASHBOARD_PATH, SIGNUP_PATH } from "../__fixtures__/paths";
import { createTestUser } from "../__fixtures__/users";

describe("Signup flow", () => {
  it("allows a new user to sign up and redirects to dashboard", () => {
    const user = createTestUser();

    cy.visit(SIGNUP_PATH);

    // Assert signup page renders
    cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
      "be.visible",
    );

    // Fill out the form
    cy.get('[data-cy="signup-username-input"]').type(user.username);
    cy.get('[data-cy="signup-email-input"]').type(user.email);
    cy.get('[data-cy="signup-password-input"]').type(user.password);

    // Optional: basic a11y check before submitting
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ["critical"] });

    // Submit the form
    cy.get('[data-cy="signup-submit-button"]').click();

    // Expect redirect to dashboard
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);

    // Verify dashboard heading for a regular user
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});

describe("Signup flow with Database Tasks", () => {
  beforeEach(() => {
    // Ensure clean test database state
    cy.cleanupTestDatabase();
    cy.setupTestDatabase();
  });

  // test fails in after
  after(() => {
    // Clean up after all tests
    cy.cleanupTestDatabase();
  });

  it("allows a new user to sign up and redirects to dashboard", () => {
    const user = createTestUser();

    cy.visit(SIGNUP_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
      "be.visible",
    );

    cy.get('[data-cy="signup-username-input"]').type(user.username);
    cy.get('[data-cy="signup-email-input"]').type(user.email);
    cy.get('[data-cy="signup-password-input"]').type(user.password);

    cy.get('[data-cy="signup-submit-button"]').click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DEFAULT_TIMEOUT);

    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
