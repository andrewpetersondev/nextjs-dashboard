/// <reference types="../cypress.d.ts" />
/// <reference types="cypress" />

Cypress.Commands.add("signup", (user) => {
	cy.log("Signing up user", user.email);
	cy.visit("/signup");
	cy.get('[data-cy="signup-username-input"]').type(user.username);
	cy.get('[data-cy="signup-email-input"]').type(user.email);
	cy.get('[data-cy="signup-password-input"]').type(user.password);
	cy.get('[data-cy="signup-submit-button"]').click();
});

Cypress.Commands.add(
	"login",
	(user: Cypress.User, options?: { assertSuccess?: boolean }) => {
		cy.log("Logging in", { email: user.email });
		cy.visit("/login");
		cy.get('[data-cy="login-email-input"]').type(user.email);
		cy.get('[data-cy="login-password-input"]').type(user.password);
		cy.get('[data-cy="login-submit-button"]').click();
		if (options?.assertSuccess) {
			cy.url().should("include", "/dashboard");
			cy.log("Login successful, redirected to dashboard");
		}
	},
);

Cypress.Commands.add("createUser", (user) => {
	cy.log("Creating test user", user.email);
	cy.task("db:insert", user).then((result) => {
		cy.log("db:insert result", result);
	});
});

Cypress.Commands.add("deleteUser", (email) => {
	cy.log("Deleting test user", email);
	cy.task("db:delete", email).then((result) => {
		cy.log("db:delete result", result);
	});
});
