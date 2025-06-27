/// <reference types="cypress" />
/// <reference path="../../../cypress.d.ts" />

import { TEST_USER_CREDENTIALS } from "../../../support/types.ts";

describe("Signup E2E", () => {
	beforeEach(() => {
		return cy.ensureUserDeleted(TEST_USER_CREDENTIALS.email);
	});

	afterEach(() => {
		return cy.ensureUserDeleted(TEST_USER_CREDENTIALS.email);
	});

	it("should sign up a new user via the UI", () => {
		cy.signup(TEST_USER_CREDENTIALS);
		cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard");
		cy.get("h1").contains("Dashboard", { timeout: 10000 }).should("be.visible");
	});
});
