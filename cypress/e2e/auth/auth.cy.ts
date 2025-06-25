/// <reference types="cypress" />
/// <reference path="../../../cypress.d.ts" />

import { _TEST_USER } from "@/cypress/e2e/__fixtures__/users";

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

		it("should log in with loginNew command and assert success", () => {
			return cy.loginNew(_TEST_USER, { assertSuccess: true });
		});
	});
});
