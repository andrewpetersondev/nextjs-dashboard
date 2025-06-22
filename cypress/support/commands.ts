/// <reference types="cypress" />

import { SESSION_COOKIE_NAME } from "../../src/lib/auth/constants";
import type { UserEntity } from "../../src/lib/db/entities/user";
import type { UserRole } from "../../src/lib/definitions/enums";
import { generateMockSessionJWT } from "./session-mock";

/**
 * Credentials required for user login.
 * @property email - User's email address.
 * @property password - User's password.
 * @property username - User's username.
 */
export interface UserCredentials {
	email: string;
	password: string;
	username: string;
}

/**
 * Input type for creating a user in tests.
 * Omits id and sensitiveData from UserEntity.
 * Role is optional and compatible with UserEntity.
 */
export type CreateUserInput = Omit<UserEntity, "id" | "sensitiveData"> & {
	role?: UserEntity["role"];
};

/**
 * Signs up a user via the UI.
 * Navigates to the signup page, fills out the form, and submits.
 * @param user - User credentials (username, email, password).
 * @returns Chainable<void>
 * @example
 *   cy.signup({ username, email, password });
 */
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

/**
 * Logs in a user via the UI.
 * Navigates to the login page, fills out the form, and submits.
 * Optionally asserts successful login by checking dashboard redirect.
 * @param user - User credentials (username, email, password).
 * @param options - Optional settings (e.g., assertSuccess).
 * @returns Chainable<void>
 * @example
 *   cy.login({ email, password, username }, { assertSuccess: true });
 */
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

/**
 * Creates a user in the test database.
 * Always deletes the user first to avoid unique constraint errors.
 * @param user - User data for creation.
 * @returns Chainable<UserEntity | null> Resolves to the created user object or null if not created.
 * @example
 *   cy.createUser({ email, password, username, ... });
 */
Cypress.Commands.add("createUser", (user: CreateUserInput) => {
	cy.log("Creating test user", user.email);
	return cy.task("db:deleteUser", user.email).then(() =>
		cy.task("db:createUser", user).then((result) => {
			cy.log("db:createUser result", result);
			return cy.wrap(result?.data ?? null);
		}),
	);
});

/**
 * Finds a user in the test database by email.
 * @param email - The user's email address.
 * @returns Chainable<UserEntity | null> Resolves to the found user or null if not found.
 * @example
 *   cy.findUser("test@example.com");
 */
Cypress.Commands.add("findUser", (email: string) => {
	cy.log("Finding test user", email);
	return cy.task("db:findUser", email).then((result) => {
		cy.log("Found user", result);
		return cy.wrap(result?.data ?? null);
	});
});

/**
 * Updates a user in the test database.
 * @param email - The user's email address.
 * @param updates - Partial user data to update.
 * @returns Chainable<string | null> Resolves to the updated user's email or null if not found.
 * @example
 *   cy.updateUser("test@example.com", { username: "newName" });
 */
Cypress.Commands.add(
	"updateUser",
	(email: string, updates: Partial<UserEntity>) => {
		cy.log("Updating test user", email, updates);
		return cy.task("db:updateUser", { email, updates }).then((result) => {
			cy.log("db:updateUser result", result);
			return cy.wrap(result?.data?.email ?? null);
		});
	},
);

/**
 * Deletes a user from the test database by email.
 * @param email - The user's email address.
 * @returns Chainable<string | null> Resolves to the deleted user's email or null if not found.
 * @example
 *   cy.deleteUser("test@example.com");
 */
Cypress.Commands.add("deleteUser", (email: string) => {
	cy.log("deleteUser", email);
	return cy.task("db:deleteUser", email).then((result) => {
		cy.log("db:deleteUser result", result);
		return cy.wrap(result?.data?.email ?? null);
	});
});

/**
 * Caches and restores a user's login session using cy.session.
 * Ensures fast, reliable authentication for E2E tests.
 * @param user - User credentials for login.
 * @returns Chainable<void>
 * @example
 *   cy.loginSession({ email, password, username });
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
 * @param userId - The user's unique identifier.
 * @param role - The user's role (default: "user").
 * @returns Chainable<void>
 */
Cypress.Commands.add(
	"setMockSessionCookie",
	(userId: string, role: UserRole = "user") => {
		cy.then(async () => {
			const token = await generateMockSessionJWT(userId, role);

			// Set the cookie with correct options
			cy.setCookie(SESSION_COOKIE_NAME, token, {
				httpOnly: false, // Cypress cannot set httpOnly cookies
				path: "/",
				sameSite: "lax",
				secure: false,
			});

			// Assert the cookie is set
			cy.getCookie(SESSION_COOKIE_NAME).should("exist");
		});
	},
);

/**
 * Logs in a user via the login form using Cypress.
 * Designed for Next.js App Router (v15+) with strict typing and best practices.
 * Hides password from Cypress logs for security.
 * Optionally asserts login success by checking dashboard redirect.
 * @param user - User credentials (email, password, username).
 * @param options - Optional settings (e.g., assertSuccess).
 * @returns Chainable<void>
 * @example
 *   cy.loginNew({ email, password, username }, { assertSuccess: true });
 */
Cypress.Commands.add(
	"loginNew",
	(
		user: Pick<UserEntity, "email" | "password" | "username">,
		options?: { assertSuccess?: boolean },
	) => {
		cy.get('input[name="email"]').type(user.email);
		cy.get('input[name="password"]').type(user.password, { log: false }); // Hide password in logs
		cy.get('[data-cy="login-submit-button"]').click();

		if (options?.assertSuccess) {
			cy.url().should("include", "/dashboard");
			cy.contains(`Dashboard`);
		}
	},
);

/**
 * @deprecated Use setMockSessionCookie instead.
 * Sets a valid session cookie for the given user.
 * Mimics functions encrypt and createSession.
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
//         httpOnly: false,
// 				path: "/",
// 				sameSite: "lax",
// 				secure: Cypress.env("NODE_ENV") === "production",
// 			});
// 		});
// 	},
// );
