/// <reference types="cypress" />

import { SESSION_COOKIE_NAME } from "../../src/lib/auth/constants";
import type { UserEntity } from "../../src/lib/db/entities/user";
import type { UserRole } from "../../src/lib/definitions/enums";
import { generateMockSessionJWT } from "./session-mock";
import type {
	CreateUserInput,
	DbTaskResult,
	LoginCredentials,
	SignupUserInput,
	UserCredentials,
} from "./types";

// --- Constants for selectors (avoid magic strings) ---
const SIGNUP_USERNAME_INPUT = '[data-cy="signup-username-input"]';
const SIGNUP_EMAIL_INPUT = '[data-cy="signup-email-input"]';
const SIGNUP_PASSWORD_INPUT = '[data-cy="signup-password-input"]';
const SIGNUP_SUBMIT_BUTTON = '[data-cy="signup-submit-button"]';
const LOGIN_EMAIL_INPUT = '[data-cy="login-email-input"]';
const LOGIN_PASSWORD_INPUT = '[data-cy="login-password-input"]';
const LOGIN_SUBMIT_BUTTON = '[data-cy="login-submit-button"]';
// const DASHBOARD_HEADING = "h1";

// --- Strictly typed options interface ---
// interface LoginOptions {
// 	assertSuccess?: boolean;
// 	timeout?: number;
// }

// =========================
// UI COMMANDS
// =========================

/**
 * Signs up a user via the UI.
 * Accepts a strictly typed SignupUserInput.
 */
Cypress.Commands.add("signup", (user: SignupUserInput) => {
	cy.log("Signing up user", user.email);
	cy.visit("/signup");
	cy.get(SIGNUP_USERNAME_INPUT).type(user.username);
	cy.get(SIGNUP_EMAIL_INPUT).type(user.email);
	cy.get(SIGNUP_PASSWORD_INPUT).type(user.password);
	cy.get(SIGNUP_SUBMIT_BUTTON).click();
});

/**
 * Logs in a user via the UI.
 * Accepts strictly typed LoginCredentials.
 */
Cypress.Commands.add("login", (user: LoginCredentials) => {
	cy.log("Logging in user", user.email);
	cy.visit("/login");
	cy.get(LOGIN_EMAIL_INPUT).type(user.email);
	cy.get(LOGIN_PASSWORD_INPUT).type(user.password);
	cy.get(LOGIN_SUBMIT_BUTTON).click();
});

/**
 * Logs in a user via the login form using Cypress.
 * Accepts LoginCredentials and optional assertion.
 */
Cypress.Commands.add(
	"loginNew",
	(user: LoginCredentials, options?: { assertSuccess?: boolean }) => {
		cy.get('input[name="email"]').type(user.email);
		cy.get('input[name="password"]').type(user.password, { log: false });
		cy.get('[data-cy="login-submit-button"]').click();

		if (options?.assertSuccess) {
			cy.url().should("include", "/dashboard");
			cy.contains(`Dashboard`);
		}
	},
);

// =========================
// SERVER/DB/SESSION COMMANDS
// =========================

/**
 * Creates a user in the test database.
 * On success, returns the created user.
 * On failure, throws an error with details.
 */
Cypress.Commands.add("createUser", (user: CreateUserInput) => {
	cy.log("Creating test user", user.email);
	return cy.task("db:createUser", user).then((result) => {
		// todo: implement the commented out error handling in relavent commands
		// if (!result.success || !result.data) {
		// 	throw new Error(
		// 		`[createUser] ${result.error ?? "Unknown error"}: ${result.errorMessage ?? ""}`
		// 	);
		// }
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
		cy.log("[createUser] dbResult = ", dbResult);
		return dbResult.data; // Cypress will wrap this in a Chainable
	});
});

/**
 * Finds a user in the test database by email.
 */
Cypress.Commands.add("findUser", (email: string) => {
	cy.log("Finding test user", email);
	return cy.task("db:findUser", email).then((result) => {
		// Type guard for result
		if (!result || typeof result !== "object" || !("success" in result)) {
			throw new Error("[findUser] Invalid result from db:findUser task");
		}
		// Defensive: ensure result matches expected shape
		const dbResult = result as DbTaskResult<UserEntity>;
		if (!dbResult.success || !dbResult.data) {
			throw new Error(
				`[findUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
			);
		}
		cy.log("[findUser] dbResult =  ", dbResult);
		return dbResult.data; // Cypress will wrap this in a Chainable
	});
});

/**
 * Updates a user in the test database.
 */
Cypress.Commands.add(
	"updateUser",
	(email: string, updates: Partial<UserEntity>) => {
		cy.log("updateUser", email, updates);

		return cy.task("db:updateUser", { email, updates }).then((result) => {
			// Type guard for result
			if (!result || typeof result !== "object" || !("success" in result)) {
				throw new Error("[updateUser] Invalid result from db:updateUser task");
			}

			// Defensive: ensure result matches expected shape
			const dbResult = result as DbTaskResult<UserEntity>;

			if (!dbResult.success || !dbResult.data) {
				throw new Error(
					`[updateUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
				);
			}

			cy.log("db:updateUser result", result);
			return dbResult.data; // Cypress will wrap this in a Chainable
		});
	},
);

/**
 * Deletes a user from the test database by email.
 */
Cypress.Commands.add("deleteUser", (email: string) => {
	cy.log("deleteUser", email);

	return cy.task("db:deleteUser", email).then((result) => {
		// Type guard for result
		if (!result || typeof result !== "object" || !("success" in result)) {
			throw new Error("[deleteUser] Invalid result from db:deleteUser task");
		}

		// Defensive: ensure result matches expected shape
		const dbResult = result as DbTaskResult<UserEntity>;

		if (!dbResult.success || !dbResult.data) {
			throw new Error(
				`[deleteUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
			);
		}

		cy.log("db:deleteUser result", result);
		return dbResult.data; // Cypress will wrap this in a Chainable
	});
});

/**
 * Idempotently deletes a user from the test database by email.
 * Does not throw if the user does not exist.
 * Returns null if user was not found, or the deleted user entity if deleted.
 * This is safe for use in beforeEach/afterEach hooks.
 */
Cypress.Commands.add("ensureUserDeleted", (email: string) => {
	cy.log("ensureUserDeleted", email);
	// Always return the Cypress chain for proper command queueing
	return cy
		.task<DbTaskResult<UserEntity>>("db:deleteUser", email)
		.then((result) => {
			// Type guard for result shape
			if (!result || typeof result !== "object" || !("success" in result)) {
				throw new Error(
					"[ensureUserDeleted] Invalid result from db:deleteUser task",
				);
			}
			// Treat "USER_NOT_FOUND" as a successful, idempotent outcome
			if (
				result.error === "USER_NOT_FOUND" ||
				(result.success === false && result.error === "USER_NOT_FOUND")
			) {
				cy.log(`[ensureUserDeleted] User not found: ${email}, continuing`);
				return cy.wrap(null); // <-- Wrap in cy.wrap for Cypress chain
			}
			// Throw for all other errors
			if (!result.success && result.error) {
				throw new Error(
					`[ensureUserDeleted] ${result.error}: ${result.errorMessage ?? ""}`,
				);
			}
			cy.log("[ensureUserDeleted] dbResult = ", result);
			return cy.wrap(result.data ?? null); // <-- Wrap in cy.wrap for Cypress chain
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
		// todo: avoid mixing async/await with Cypress commands. use cypress promise chaining or wrap async logic in  a cypress task
		cy.then(() => {
			const token = generateMockSessionJWT(userId, role);

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
