/// <reference types="cypress" />
/// <reference path="../../../cypress.d.ts" />

export const _loginViaUI = (user: { email: string; password: string }) => {
	cy.visit("/login");
	cy.get('[data-cy="login-email-input"]').type(user.email);
	cy.get('[data-cy="login-password-input"]').type(user.password, {
		log: false,
	});
	cy.get('[data-cy="login-submit-button"]').click();
};

/**
 * Utility to assert successful login.
 * Ensures user is redirected and dashboard is visible.
 */
const _assertLoginSuccess = (): void => {
	cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard"); // Assert redirect
	cy.get("h1").contains("Dashboard", { timeout: 10000 }).should("be.visible"); // Assert UI
};
