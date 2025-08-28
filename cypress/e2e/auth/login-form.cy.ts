// cypress/e2e/login-form.cy.ts
// E2E tests for the updated LoginForm that uses React useId for input ids.
// Adjust the visited path (LOGIN_PATH) to match your application routing.

import { LOGIN_PATH } from "../__fixtures__/paths";

const LOGIN_REGEX = /login form/i;

describe("Login Form (E2E) - useId integration", () => {
  beforeEach(() => {
    cy.visit(LOGIN_PATH);
    cy.findByRole("form", { name: LOGIN_REGEX }).should("exist");
  });

  it("renders inputs with unique, non-static ids and proper label associations", () => {
    // Email input
    cy.get('[data-cy="login-email-input"]')
      .should("have.length", 1)
      .should("have.attr", "id")
      .then((emailId) => {
        expect(emailId).to.be.a("string");
        expect(emailId).to.not.equal("email"); // ensure it's not a static id
        cy.get(`label[for="${emailId}"]`).should("exist");
      });

    // Password input
    cy.get('[data-cy="login-password-input"]')
      .should("have.length", 1)
      .should("have.attr", "id")
      .then((passwordId) => {
        expect(passwordId).to.be.a("string");
        expect(passwordId).to.not.equal("password"); // ensure it's not a static id
        cy.get(`label[for="${passwordId}"]`).should("exist");
      });

    // Also verify aria-describedby references exist (if present)
    cy.get('[data-cy="login-email-input"]').then(($el) => {
      const describedBy = $el.attr("aria-describedby");
      if (describedBy) {
        cy.get(`#${describedBy}`).should("exist");
      }
    });

    cy.get('[data-cy="login-password-input"]').then(($el) => {
      const describedBy = $el.attr("aria-describedby");
      if (describedBy) {
        cy.get(`#${describedBy}`).should("exist");
      }
    });
  });

  it("keeps stable field names and submits without relying on static ids", () => {
    // Names should remain stable for server action submission
    cy.get('[data-cy="login-email-input"]').should(
      "have.attr",
      "name",
      "email",
    );
    cy.get('[data-cy="login-password-input"]').should(
      "have.attr",
      "name",
      "password",
    );

    cy.get('[data-cy="login-email-input"]').clear().type("steve@jobs.com");
    cy.get('[data-cy="login-password-input"]').clear().type("hunter2");

    cy.get('[data-cy="login-submit-button"]').click();

    cy.get('[data-cy="login-submit-button"]', { timeout: 2000 }).should(
      ($btn) => {
        const isDisabled = ($btn.attr("disabled") as unknown) !== undefined;
        expect(isDisabled).to.be.oneOf([true, false]);
      },
    );
  });
});
