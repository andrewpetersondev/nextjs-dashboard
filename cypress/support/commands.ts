/// <reference types="cypress" />

import { SESSION_COOKIE_NAME } from "../../src/lib/auth/constants";
import type { UserEntity } from "../../src/lib/db/entities/user";
import type { UserRole } from "../../src/lib/definitions/enums";
import { generateMockSessionJWT } from "./session-mock";
import type { CreateUserInputV2, DbTaskResult, UserCredentials } from "./types";

/**
 * Signs up a user via the UI.
 * Navigates to the signup page, fills out the form, and submits.
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
 * On success, returns the created user.
 * On failure, throws an error with details.
 */
Cypress.Commands.add("createUser", (user: CreateUserInputV2) => {
	cy.log("Creating test user", user.email);
	return cy.task("db:createUser", user).then((result) => {
		// Type guard for result
		if (!result || typeof result !== "object" || !("success" in result)) {
			throw new Error("[createUser] Invalid result from db:createUser task");
		}
		// Defensive: ensure result matches expected shape
		const dbResult = result as DbTaskResult<UserEntity>;
		if (!dbResult.success || !dbResult.data) {
			throw new Error(
				`[createUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
			);
		}
		return dbResult.data; // Cypress will wrap this in a Chainable
	});
});

/**
 * Finds a user in the test database by email.

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

// Ignore, leave for now
// /**
//  * @deprecated Use setMockSessionCookie instead.
//  * Sets a valid session cookie for the given user.
//  * Mimics functions encrypt and createSession.
//  * @param userId - The user's unique identifier.
//  * @param role - The user's role.
//  */
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
