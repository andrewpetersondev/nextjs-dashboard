/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

import {
	LOGIN_EMAIL_INPUT,
	LOGIN_PASSWORD_INPUT,
	LOGIN_SUBMIT_BUTTON,
	SIGNUP_EMAIL_INPUT,
	SIGNUP_PASSWORD_INPUT,
	SIGNUP_SUBMIT_BUTTON,
	SIGNUP_USERNAME_INPUT,
} from "@/cypress/support/constants";
import { generateMockSessionJWT } from "@/cypress/support/session-mock";
import type {
	CreateUserInput,
	DbTaskResult,
	LoginCredentials,
	SignupUserInput,
	UserCredentials,
} from "@/cypress/support/types";
import { SESSION_COOKIE_NAME } from "@/src/lib/auth/constants";
import type { UserEntity } from "@/src/lib/db/entities/user";
import type { UserRole } from "@/src/lib/definitions/enums";

// --- UI Commands ---

Cypress.Commands.add("signup", (user: SignupUserInput) => {
	cy.log("Signing up user", user.email);
	cy.visit("/signup");
	cy.get(SIGNUP_USERNAME_INPUT).type(user.username);
	cy.get(SIGNUP_EMAIL_INPUT).type(user.email);
	cy.get(SIGNUP_PASSWORD_INPUT).type(user.password);
	cy.get(SIGNUP_SUBMIT_BUTTON).click();
});

Cypress.Commands.add("login", (user: LoginCredentials) => {
	cy.log("Logging in user", user.email);
	cy.visit("/login");
	cy.get(LOGIN_EMAIL_INPUT).type(user.email);
	cy.get(LOGIN_PASSWORD_INPUT).type(user.password);
	cy.get(LOGIN_SUBMIT_BUTTON).click();
});

/**
 * Logs in a user via the UI and optionally asserts successful login.
 * @param user - The login credentials.
 * @param options - Optional settings (e.g., assertSuccess).
 * @returns Cypress.Chainable<void>
 */
Cypress.Commands.add(
	"loginNew",
	(
		user: LoginCredentials,
		options?: { assertSuccess?: boolean },
	): Cypress.Chainable<void> => {
		cy.log("Logging in user", user.email);
		cy.visit("/login");
		cy.get(LOGIN_EMAIL_INPUT).type(user.email);
		cy.get(LOGIN_PASSWORD_INPUT).type(user.password, { log: false });
		cy.get(LOGIN_SUBMIT_BUTTON).click();

		// Always return a chainable with void type
		return cy.then<void>(() => {
			if (options?.assertSuccess) {
				cy.location("pathname", { timeout: 10000 }).should(
					"include",
					"/dashboard",
				);
				cy.get("h1", { timeout: 10000 })
					.contains("Dashboard")
					.should("be.visible");
			}
			return cy.wrap(undefined);
		});
	},
);

// --- DB Commands ---

Cypress.Commands.add("createUser", (user: CreateUserInput) => {
	cy.log("Creating test user", user.email);
	return cy.task("db:createUser", user).then((result) => {
		if (!result || typeof result !== "object" || !("success" in result)) {
			throw new Error("[createUser] Invalid result from db:createUser task");
		}
		const dbResult = result as DbTaskResult<UserEntity>;
		if (!dbResult.success || !dbResult.data) {
			throw new Error(
				`[createUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
			);
		}
		cy.log("[createUser] dbResult = ", dbResult);
		return cy.wrap(dbResult.data);
	});
});

Cypress.Commands.add("findUser", (email: string) => {
	cy.log("Finding test user", email);
	return cy.task("db:findUser", email).then((result) => {
		if (!result || typeof result !== "object" || !("success" in result)) {
			throw new Error("[findUser] Invalid result from db:findUser task");
		}
		const dbResult = result as DbTaskResult<UserEntity>;
		if (!dbResult.success || !dbResult.data) {
			throw new Error(
				`[findUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
			);
		}
		cy.log("[findUser] dbResult =  ", dbResult);
		return cy.wrap(dbResult.data);
	});
});

Cypress.Commands.add(
	"updateUser",
	(email: string, updates: Partial<UserEntity>) => {
		cy.log("updateUser", email, updates);
		return cy.task("db:updateUser", { email, updates }).then((result) => {
			if (!result || typeof result !== "object" || !("success" in result)) {
				throw new Error("[updateUser] Invalid result from db:updateUser task");
			}
			const dbResult = result as DbTaskResult<UserEntity>;
			if (!dbResult.success || !dbResult.data) {
				throw new Error(
					`[updateUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
				);
			}
			cy.log("db:updateUser result", result);
			return dbResult.data;
		});
	},
);

Cypress.Commands.add("deleteUser", (email: string) => {
	cy.log("deleteUser", email);
	return cy.task("db:deleteUser", email).then((result) => {
		if (!result || typeof result !== "object" || !("success" in result)) {
			throw new Error("[deleteUser] Invalid result from db:deleteUser task");
		}
		const dbResult = result as DbTaskResult<UserEntity>;
		if (!dbResult.success || !dbResult.data) {
			throw new Error(
				`[deleteUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
			);
		}
		cy.log("db:deleteUser result", result);
		return dbResult.data;
	});
});

Cypress.Commands.add(
	"ensureUserDeleted",
	(email: string): Cypress.Chainable<UserEntity | null> => {
		cy.log("ensureUserDeleted", email);
		return cy
			.task<DbTaskResult<UserEntity>>("db:deleteUser", email)
			.then((result) => {
				if (!result || typeof result !== "object" || !("success" in result)) {
					throw new Error(
						"[ensureUserDeleted] Invalid result from db:deleteUser task",
					);
				}
				if (
					result.error === "USER_NOT_FOUND" ||
					(!result.success && result.error === "USER_NOT_FOUND")
				) {
					cy.log(`[ensureUserDeleted] User not found: ${email}, continuing`);
					return cy.wrap<UserEntity | null>(null);
				}
				if (!result.success && result.error) {
					throw new Error(
						`[ensureUserDeleted] ${result.error}: ${result.errorMessage ?? ""}`,
					);
				}
				cy.log("[ensureUserDeleted] dbResult = ", result);
				return cy.wrap<UserEntity | null>(result.data ?? null);
			});
	},
);

Cypress.Commands.add("loginSession", (user: UserCredentials) => {
	cy.session(
		user.email,
		() => {
			cy.visit("/login");
			cy.get('[data-cy="login-email-input"]').type(user.email);
			cy.get('[data-cy="login-password-input"]').type(user.password, {
				log: true,
			});
			cy.get('[data-cy="login-submit-button"]').click();
			cy.url().should("include", "/dashboard");
			cy.getCookie(SESSION_COOKIE_NAME).should("exist");
		},
		{
			cacheAcrossSpecs: true,
			validate: () => {
				cy.getCookie(SESSION_COOKIE_NAME).should("exist");
			},
		},
	);
});

Cypress.Commands.add(
	"setMockSessionCookie",
	(userId: string, role: UserRole = "user") => {
		cy.then(() => {
			return generateMockSessionJWT(userId, role);
		}).then((token) => {
			cy.setCookie(SESSION_COOKIE_NAME, token, {
				httpOnly: false,
				path: "/",
				sameSite: "lax",
				secure: false,
			});
			cy.getCookie(SESSION_COOKIE_NAME).should("exist");
		});
	},
);
