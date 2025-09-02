import { DASHBOARD_PATH, SIGNUP_PATH } from "../shared/paths";
import { UI_MATCHERS } from "../shared/regex";
import { SEL } from "../shared/selectors";
import { DEFAULT_TIMEOUT } from "../shared/times";
import { createTestUser } from "../shared/users";

describe("Signup flow", () => {
  it("allows a new user to sign up and redirects to dashboard", () => {
    const user = createTestUser();

    cy.visit(SIGNUP_PATH);

    // Assert signup page renders
    cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
      "be.visible",
    );

    // Fill out the form
    cy.get(SEL.signupUsername).type(user.username);
    cy.get(SEL.signupEmail).type(user.email);
    cy.get(SEL.signupPassword).type(user.password);

    // Optional: basic a11y check before submitting
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ["critical"] }, undefined, true);

    // Submit the form
    cy.get(SEL.signupSubmit).click();

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
  // beforeEach(() => {
  // Ensure clean test database state
  // });

  // Avoid after() with tasks to prevent failures on runner teardown.
  // afterEach(() => {
  // Best-effort cleanup after each test in this suite
  // });

  it("allows a new user to sign up and redirects to dashboard", () => {
    const user = createTestUser();

    cy.visit(SIGNUP_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
      "be.visible",
    );

    cy.get(SEL.signupUsername).type(user.username);
    cy.get(SEL.signupEmail).type(user.email);
    cy.get(SEL.signupPassword).type(user.password);

    cy.get(SEL.signupSubmit).click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);

    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
