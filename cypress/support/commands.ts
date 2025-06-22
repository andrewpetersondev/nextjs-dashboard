/// <reference types="cypress" />

import { SESSION_COOKIE_NAME } from "../../src/lib/auth/constants";
import type { UserEntity } from "../../src/lib/db/entities/user";
import type { UserRole } from "../../src/lib/definitions/enums";
import { generateMockSessionJWT } from "./session-mock";

/**
 * Credentials required for user login.
 */
export interface UserCredentials {
	email: string;
	password: string;
	username: string;
}

/**
 * Input type for creating a user in tests.
 * - Omits id and sensitiveData.
 * - Makes role optional and compatible with UserEntity.
 */
export type CreateUserInput = Omit<UserEntity, "id" | "sensitiveData"> & {
	role?: UserEntity["role"];
};

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
Cypress.Commands.add("createUser", (user: CreateUserInput) => {
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

/**
 * Caches and restores a user's login session using cy.session.
 * Ensures fast, reliable authentication for E2E tests.
 * @param user - User credentials for login
 */
Cypress.Commands.add("loginSession", (user: UserCredentials) => {
	cy.session(
		user.email, // Use email as unique session key
		() => {
			cy.visit("/login");
			cy.get('[data-cy="login-email-input"]').type(user.email);
			cy.get('[data-cy="login-password-input"]').type(user.password, {
				log: true,
			});
			cy.get('[data-cy="login-submit-button"]').click();

			// Wait for login to complete and session to be set
			cy.url().should("include", "/dashboard");

			// Validate session is set in localStorage
			cy.window().then((win) => {
				const session = win.localStorage.getItem(SESSION_COOKIE_NAME);
				expect(session, `Session key ${SESSION_COOKIE_NAME} should exist`).to
					.exist;
			});
		},
		{
			cacheAcrossSpecs: true,
			validate: () => {
				// Ensure session is still valid before restoring
				cy.window().then((win) => {
					const session = win.localStorage.getItem(SESSION_COOKIE_NAME);
					expect(session, `Session key ${SESSION_COOKIE_NAME} should exist`).to
						.exist;
				});
			}, // Share session across spec files
		},
	);
});

/**
 * Sets a valid mock session cookie for the given user.
 * Use only in Cypress E2E tests.
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 */
Cypress.Commands.add(
	"setMockSessionCookie",
	(userId: string, role: UserRole = "user") => {
		// Use cy.then to handle the async promise and avoid floating promises
		cy.then(async () => {
			const token = await generateMockSessionJWT(userId, role);

			// Log the session token for debugging and visibility
			Cypress.log({
				consoleProps: () => ({ role, token, userId }),
				message: [`userId: ${userId}`, `role: ${role}`, `token: ${token}`],
				name: "setMockSessionCookie",
			});

			cy.setCookie(SESSION_COOKIE_NAME, token, {
				httpOnly: false,
				path: "/", // Cypress cannot set httpOnly cookies
				sameSite: "lax",
				secure: false,
			});
		});
	},
);

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

/**
 * @deprecated
 ** Sets a valid session cookie for the given user.
 **  mimics functions encrypt and createSession
 * @param userId - The user's unique identifier.
 * @param role - The user's role.
 */
// Cypress.Commands.add(
// 	"setSessionCookie",
// 	(userId: string, role: UserRole = "user") => {
// 		const expiresAt = Date.now() + SESSION_DURATION_MS;
// 		const payload: EncryptPayload = { user: { expiresAt, role, userId } };
// 		encrypt(payload).then((token) => {
// 			cy.setCookie(SESSION_COOKIE_NAME, token, {
// 				expiry: expiresAt,
// 				httpOnly: false, // Cypress cannot set httpOnly cookies, but this is fine for E2E
// 				path: "/",
// 				sameSite: "lax",
// 				secure: Cypress.env("NODE_ENV") === "production",
// 			});
// 		});
// 	},
// );
