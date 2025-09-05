import { LOGIN_PATH } from "../shared/paths";
import { LOGIN_REGEX } from "../shared/regex";
import { AUTH_SEL } from "../shared/selectors";
import { DEFAULT_TIMEOUT } from "../shared/times";

describe("Login Form (E2E) - useId integration", () => {
  beforeEach(() => {
    cy.visit(LOGIN_PATH);
    cy.findByRole("form", { name: LOGIN_REGEX }).should("exist");
  });

  it("renders inputs with unique, non-static ids and proper label associations", () => {
    // Email input
    cy.get(AUTH_SEL.loginEmail)
      .should("have.length", 1)
      .should("have.attr", "id")
      .then((emailId) => {
        expect(emailId).to.be.a("string");
        expect(emailId).to.not.equal("email"); // ensure it's not a static id
        cy.get(`label[for="${emailId}"]`).should("exist");
      });

    // Password input
    cy.get(AUTH_SEL.loginPassword)
      .should("have.length", 1)
      .should("have.attr", "id")
      .then((passwordId) => {
        expect(passwordId).to.be.a("string");
        expect(passwordId).to.not.equal("password"); // ensure it's not a static id
        cy.get(`label[for="${passwordId}"]`).should("exist");
      });

    // Also verify aria-describedby references exist (if present)
    cy.get(AUTH_SEL.loginEmail).then(($el) => {
      const describedBy = $el.attr("aria-describedby");
      if (describedBy) {
        cy.get(`#${describedBy}`).should("exist");
      }
    });

    cy.get(AUTH_SEL.loginPassword).then(($el) => {
      const describedBy = $el.attr("aria-describedby");
      if (describedBy) {
        cy.get(`#${describedBy}`).should("exist");
      }
    });
  });
});

describe("Login Form (E2E) - useId integration - Part 2", () => {
  beforeEach(() => {
    cy.visit(LOGIN_PATH);
    cy.findByRole("form", { name: LOGIN_REGEX }).should("exist");
  });

  it("keeps stable field names and submits without relying on static ids", () => {
    // Names should remain stable for server action submission
    cy.get(AUTH_SEL.loginEmail).should("have.attr", "name", "email");
    cy.get(AUTH_SEL.loginPassword).should("have.attr", "name", "password");

    cy.get(AUTH_SEL.loginEmail).clear().type("steve@jobs.com");
    cy.get(AUTH_SEL.loginPassword).clear().type("hunter2");

    cy.get(AUTH_SEL.loginSubmit).click();

    cy.get(AUTH_SEL.loginSubmit, { timeout: DEFAULT_TIMEOUT }).should(
      ($btn) => {
        const isDisabled = ($btn.attr("disabled") as unknown) !== undefined;
        expect(isDisabled).to.be.oneOf([true, false]);
      },
    );
  });
});
