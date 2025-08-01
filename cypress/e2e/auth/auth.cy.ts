import { _TEST_USER } from "../__fixtures__/users.ts";

/**
 * E2E tests for authentication commands.
 * Uses reusable user constants for type safety and maintainability.
 */
describe("Auth Commands", () => {
  before(() => {
    return cy.ensureUserDeleted(_TEST_USER.email);
  });

  after(() => {
    return cy.ensureUserDeleted(_TEST_USER.email);
  });

  context("Auth Commands via UI", () => {
    it("should sign up a new user with custom command", () => {
      return cy.signup(_TEST_USER);
    });

    it("should log in with created user with custom command", () => {
      return cy.login(_TEST_USER);
    });

    // this will fail because of cookie issues
    it("should log in with loginNew command and assert success", () => {
      return cy.loginNew(_TEST_USER, { assertSuccess: true });
    });
  });
});
