/// <reference types="cypress" />
/** biome-ignore-all lint/style/noNamespace: <temp> */

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
      loginAsTestUser(): Chainable<void>;
      createTestItem(name: string): Chainable<void>;
      signup(creds: SignupCreds): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit(LOGIN_PATH);
  cy.get(SEL.loginEmail).clear().type(email);
  cy.get(SEL.loginPassword).clear().type(password, { log: false });
  cy.get(SEL.loginSubmit).click();
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
  cy.location("pathname", { timeout: 20_000 }).should(
    "include",
    DASHBOARD_PATH,
  );
});
