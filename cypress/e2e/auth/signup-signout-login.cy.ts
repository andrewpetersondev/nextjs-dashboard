import { DASHBOARD_PATH, LOGIN_PATH, SIGNUP_PATH } from "../shared/paths";
import { UI_MATCHERS_REGEX } from "../shared/regex";
import { AUTH_SEL } from "../shared/selectors";
import { DEFAULT_TIMEOUT } from "../shared/times";
import { createTestUser } from "../shared/users";

describe("Signup → Sign out → Login flow", () => {
  it("allows a user to sign up, sign out, and then log back in", () => {
    const user = createTestUser();

    // 1) Sign up
    cy.visit(SIGNUP_PATH);
    cy.findByRole("heading", { name: UI_MATCHERS_REGEX.signupHeading }).should(
      "be.visible",
    );

    cy.get(AUTH_SEL.signupUsername).type(user.username);
    cy.get(AUTH_SEL.signupEmail).type(user.email);
    cy.get(AUTH_SEL.signupPassword).type(user.password);

    cy.get(AUTH_SEL.signupSubmit).click();

    // 2) Redirects to dashboard after signup
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS_REGEX.dashboardH1,
    }).should("be.visible");

    // 3) Sign out from the dashboard (Logout button has aria-label "Sign Out")
    cy.findByRole("button", {
      name: UI_MATCHERS_REGEX.signoutButton,
    }).click();

    // 4) After logout, redirected home
    cy.findByText(UI_MATCHERS_REGEX.welcomeHome, {
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
      name: UI_MATCHERS_REGEX.dashboardH1,
    }).should("be.visible");
  });
});
