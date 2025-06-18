import type { UserEntity } from "../../src/lib/db/entities/user";

// Sign up a user via UI
Cypress.Commands.add(
	"signup",
	(user: Pick<UserEntity, "username" | "email" | "password">) => {
		cy.log("Signing up user", user.email);
		cy.visit("/signup");
		cy.get('[data-cy="signup-username-input"]').type(user.username);
		cy.get('[data-cy="signup-email-input"]').type(user.email);
		cy.get('[data-cy="signup-password-input"]').type(user.password);
		cy.get('[data-cy="signup-submit-button"]').click();
	},
);

// Log in a user via UI
Cypress.Commands.add(
	"login",
	(
		user: Pick<UserEntity, "username" | "email" | "password">,
		options?: { assertSuccess?: boolean },
	) => {
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

// Create a user in the DB
Cypress.Commands.add("createUser", (user: UserEntity) => {
	cy.log("Creating test user", user.email);
	// Always delete the user first to avoid unique constraint errors
	cy.task("db:deleteUser", user.email).then(() => {
		cy.task("db:createUser", user).then((result) => {
			cy.log("db:createUser result", result);
		});
	});
});

// Find a user in the DB
Cypress.Commands.add("findUser", (email: string) => {
	cy.log("Finding test user", email);
	cy.task("db:findUser", email).then((result) => cy.log("Found user", result));
});

// Update a user in the DB
Cypress.Commands.add(
	"updateUser",
	(email: string, updates: Partial<UserEntity>) => {
		cy.log("Updating test user", email, updates);
		cy.task("db:updateUser", { email, updates }).then((result) =>
			cy.log("db:updateUser result", result),
		);
	},
);

// Delete a user from the DB
Cypress.Commands.add("deleteUser", (email: string) => {
	cy.log("deleteUser", email);
	cy.task("db:deleteUser", email).then((result) =>
		// log does not appear in cypress ui or terminal
		cy.log("db:deleteUser result", result),
	);
});

Cypress.Commands.add(
	"loginNew",
	(
		user: Pick<UserEntity, "email" | "password" | "username">,
		options?: { assertSuccess?: boolean },
	) => {
		cy.get('input[name="email"]').type(user.email);
		cy.get('input[name="password"]').type(user.password, { log: false }); // Hide password in logs
		cy.get('[data-cy="login-submit-button"]').click(); // <-- Use unique selector

		// junk comment
		// Optionally assert login success
		if (options?.assertSuccess) {
			cy.url().should("include", "/dashboard");
			cy.contains(`Dashboard`);
		}
	},
);
