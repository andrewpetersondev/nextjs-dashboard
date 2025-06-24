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
