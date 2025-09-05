import { DASHBOARD_PATH, LOGIN_PATH } from "../shared/paths";
import { UI_MATCHERS } from "../shared/regex";
import { AUTH_SEL } from "../shared/selectors";
import { DEFAULT_TIMEOUT } from "../shared/times";
import { createTestUser } from "../shared/users";

describe("Signup → Sign out → Login flow", () => {
  const user = createTestUser();

  beforeEach(function () {
    const url = Cypress.env("DATABASE_URL");
    if (!url) {
      console.warn("Skipping DB tasks tests; DATABASE_URL is not set");
      this.skip();
    }
    cy.logEnv();
    cy.log("DATABASE_URL:", url);
    cy.log("user:", user);
  });

  it("allows a user to sign up, sign out, and then log back in", () => {
    // 1) Sign up
    cy.signup({
      email: user.email,
      password: user.password,
      username: user.username,
    });

    // 2) Redirects to dashboard after signup
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");

    // 3) Sign out from the dashboard (Logout button has aria-label "Sign Out")
    cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).click();

    // 4) After logout, redirected to home
    cy.findByText(UI_MATCHERS.WELCOME_HOME, {
      timeout: DEFAULT_TIMEOUT,
    }).should("be.visible");

    // 5) Go to the login and login with the same credentials
    cy.get(AUTH_SEL.toLoginButton).click();
    cy.url().should("include", LOGIN_PATH);

    cy.get(AUTH_SEL.loginEmail).type(user.email);
    cy.get(AUTH_SEL.loginPassword).type(user.password);
    cy.get(AUTH_SEL.loginSubmit).click();

    // 6) Back on dashboard after login
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
