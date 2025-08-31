/// <reference types="cypress" />
/** biome-ignore-all lint/style/noNamespace: <temp> */

import { TWENTY_SECONDS } from "../e2e/__fixtures__/constants";
import {
  DASHBOARD_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
} from "../e2e/__fixtures__/paths";
import { UI_MATCHERS } from "../e2e/__fixtures__/regex";
import { SEL } from "../e2e/__fixtures__/selectors";
import type { SignupCreds } from "../e2e/__fixtures__/types";

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginAsDemoAdmin(): Chainable<void>;
      loginAsDemoUser(): Chainable<void>;
      logoutViaForm(): Chainable<void>;
      signup(creds: SignupCreds): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit(LOGIN_PATH);
  cy.get(SEL.loginEmail).clear().type(email);
  cy.get(SEL.loginPassword).clear().type(password);
  cy.get(SEL.loginSubmit).click();
  // Wait for client-side navigation to dashboard to complete (aligns with other commands)
  cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
    "include",
    DASHBOARD_PATH,
  );
});

Cypress.Commands.add("signup", ({ username, email, password }: SignupCreds) => {
  cy.visit(SIGNUP_PATH);
  cy.findByRole("heading", { name: UI_MATCHERS.SIGNUP_HEADING }).should(
    "be.visible",
  );
  cy.get(SEL.signupUsername).clear().type(username);
  cy.get(SEL.signupEmail).clear().type(email);
  cy.get(SEL.signupPassword).clear().type(password, { log: false });
  // Submit and wait for client-side navigation to dashboard
  cy.get(SEL.signupSubmit).click();
  cy.location("pathname", { timeout: TWENTY_SECONDS }).should(
    "include",
    DASHBOARD_PATH,
  );
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
