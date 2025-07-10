import { _TEST_USER } from "../../__fixtures__/users.ts";

/**
 * E2E tests for authentication commands.
 * Uses reusable user constants for type safety and maintainability.
 */
describe("auth/login/assert", () => {
  before(() => {
    return cy.ensureUserDeleted(_TEST_USER.email);
  });

  after(() => {
    return cy.ensureUserDeleted(_TEST_USER.email);
  });

  context("Login with assertion", () => {
    it("should log in with created user with custom command", () => {
      return cy.createUser(_TEST_USER).then(() => {
        return cy.loginNew(_TEST_USER, { assertSuccess: true });
      });
    });
  });
});
