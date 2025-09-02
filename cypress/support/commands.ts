/// <reference types="cypress" />
/** biome-ignore-all lint/style/noNamespace: <temp> */

import type { LoginCreds, SignupCreds } from "../e2e/shared/auth-forms";
import { DASHBOARD_PATH, LOGIN_PATH, SIGNUP_PATH } from "../e2e/shared/paths";
import { UI_MATCHERS } from "../e2e/shared/regex";
import { SEL } from "../e2e/shared/selectors";
import { TWENTY_SECONDS } from "../e2e/shared/times";

declare global {
  namespace Cypress {
    interface Chainable {
      logEnv(): Chainable<void>;
      login(creds: LoginCreds): Chainable<void>;
      loginAsDemoAdmin(): Chainable<void>;
      loginAsDemoUser(): Chainable<void>;
      logoutViaForm(): Chainable<void>;
      signup(creds: SignupCreds): Chainable<void>;
    }
  }
}

Cypress.Commands.add("logEnv", () => {
  const env = Cypress.env();
  cy.log(`Cypress env: ${JSON.stringify(env, null, 2)}`);
});

Cypress.Commands.add("login", ({ email, password }: LoginCreds) => {
  cy.visit(LOGIN_PATH);

  cy.get(SEL.loginEmail).type(email);
  cy.get(SEL.loginPassword).type(password);
  cy.get(SEL.loginSubmit).click();

  cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
    "include",
    DASHBOARD_PATH,
  );
});

Cypress.Commands.add("signup", ({ username, email, password }: SignupCreds) => {
  cy.visit(SIGNUP_PATH);

  cy.get(SEL.signupUsername).type(username);
  cy.get(SEL.signupEmail).type(email);
  cy.get(SEL.signupPassword).type(password);
  cy.get(SEL.signupSubmit).click();
});

Cypress.Commands.add("loginAsDemoUser", () => {
  cy.visit(LOGIN_PATH);
  cy.findByRole("button", { name: UI_MATCHERS.LOGIN_DEMO_USER_BUTTON }).click();
  cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
    "include",
    DASHBOARD_PATH,
  );
});

Cypress.Commands.add("loginAsDemoAdmin", () => {
  cy.visit(LOGIN_PATH);
  cy.findByRole("button", {
    name: UI_MATCHERS.LOGIN_DEMO_ADMIN_BUTTON,
  }).click();
  cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
    "include",
    DASHBOARD_PATH,
  );
});

// Ensure we always land on dashboard before attempting to logout via the form
Cypress.Commands.add("logoutViaForm", () => {
  cy.visit(DASHBOARD_PATH);
  // Handle both cases:
  // - Still authenticated: we're on /dashboard, click "Sign Out" and wait for home screen.
  // - Already logged out: redirect from /dashboard to home, just assert home screen.
  cy.location("pathname", { timeout: TWENTY_SECONDS }).then((pathname) => {
    if (pathname.includes(DASHBOARD_PATH)) {
      cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).click();
    }
    cy.findByText(UI_MATCHERS.WELCOME_HOME, { timeout: TWENTY_SECONDS }).should(
      "be.visible",
    );
  });
});
