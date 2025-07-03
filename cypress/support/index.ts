/** biome-ignore-all lint/correctness/noUndeclaredVariables: biome does not have great support for cypress yet */
import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import { SESSION_COOKIE_NAME } from "../../src/lib/auth/constants.ts";
import type { UserEntity } from "../../src/lib/db/entities/user.ts";
import {
	LOGIN_EMAIL_INPUT,
	LOGIN_PASSWORD_INPUT,
	LOGIN_SUBMIT_BUTTON,
	SIGNUP_EMAIL_INPUT,
	SIGNUP_PASSWORD_INPUT,
	SIGNUP_SUBMIT_BUTTON,
	SIGNUP_USERNAME_INPUT,
} from "./constants.ts";
import { generateMockSessionJwt } from "./session-mock.ts";
import type {
	CreateUserInput,
	DbTaskResult,
	LoginCredentials,
	SignupUserInput,
	UserCredentials,
} from "./types.ts";
import "./cypress-global.css";
import { mount } from "cypress/react";
import type { UserRole } from "@/src/lib/definitions/users.types.ts";

// --- Component Tests ---

// Register the mount command for component testing
Cypress.Commands.add(
	"mount",
	(component: ReactNode, options?: Partial<MountOptions>) => {
		return mount(component, options);
	},
);

// Register additional custom mount commands if needed
Cypress.Commands.add(
	"mountV1",
	(component: ReactNode, options?: Partial<MountOptions>) => {
		return mount(component, options);
	},
);

Cypress.Commands.add(
	"mountV2",
	(component: ReactNode, options?: Partial<MountOptions>) => {
		return mount(component, options);
	},
);

// --- E2E Tests ---

// --- UI Commands ---

/**
 * Logs in a user via the UI.
 * @param user - Login credentials.
 */
Cypress.Commands.add("login", (user: LoginCredentials) => {
	cy.log("Logging in user", user.email);
	cy.visit("/login");
	cy.get(LOGIN_EMAIL_INPUT).type(user.email);
	cy.get(LOGIN_PASSWORD_INPUT).type(user.password);
	cy.get(LOGIN_SUBMIT_BUTTON).click();
});

/**
 * Logs in a user via the UI and optionally asserts successful login.
 * @param user - Login credentials.
 * @param options - Optional settings (e.g., assertSuccess).
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

		return cy.then(() => {
			if (options?.assertSuccess) {
				cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard");
				cy.get("h1", { timeout: 10000 }).contains("Dashboard").should("be.visible");
			}
		}) as Cypress.Chainable<void>;
	},
);

/**
 * Signs up a new user via the UI.
 * @param user - Signup credentials.
 */
Cypress.Commands.add("signup", (user: SignupUserInput) => {
	cy.log("Signing up user", user.email);
	cy.visit("/signup");
	cy.get(SIGNUP_USERNAME_INPUT).type(user.username);
	cy.get(SIGNUP_EMAIL_INPUT).type(user.email);
	cy.get(SIGNUP_PASSWORD_INPUT).type(user.password);
	cy.get(SIGNUP_SUBMIT_BUTTON).click();
});

// --- Db Commands ---

/**
 * Creates a user in the database using a Cypress task.
 * @param user - User creation input.
 */
Cypress.Commands.add("createUser", (user: CreateUserInput) => {
	cy.log("Creating a test user", user.email);
	return cy
		.task<DbTaskResult<UserEntity>>("db:createUser", user)
		.then((result) => {
			if (!result || typeof result !== "object" || !("success" in result)) {
				throw new Error(
					"[createUserAction] Invalid result from db:createUserAction task",
				);
			}
			const dbResult = result as DbTaskResult<UserEntity>;
			if (!(dbResult.success && dbResult.data)) {
				throw new Error(
					`[createUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
				);
			}
			cy.log("[createUserAction] dbResult = ", dbResult);
			return cy.wrap(dbResult.data);
		});
});

/**
 * Deletes a user from the database using a Cypress task.
 * @param email - User email.
 */
Cypress.Commands.add("deleteUser", (email: string) => {
	cy.log("deleteUserDal", email);
	return cy
		.task<DbTaskResult<UserEntity>>("db:deleteUser", email)
		.then((result) => {
			if (!result || typeof result !== "object" || !("success" in result)) {
				throw new Error(
					"[deleteUserDal] Invalid result from db:deleteUserDal task",
				);
			}
			const dbResult = result as DbTaskResult<UserEntity>;
			if (!(dbResult.success && dbResult.data)) {
				throw new Error(
					`[deleteUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
				);
			}
			cy.log("db:deleteUserDal result", result);
			return dbResult.data;
		});
});

/**
 * Ensures a user is deleted from the database.
 * @param email - User email.
 */
Cypress.Commands.add(
	"ensureUserDeleted",
	(email: string): Cypress.Chainable<UserEntity | null> => {
		cy.log("ensureUserDeleted", email);
		return cy
			.task<DbTaskResult<UserEntity>>("db:deleteUser", email)
			.then((result) => {
				if (!result || typeof result !== "object" || !("success" in result)) {
					throw new Error(
						"[ensureUserDeleted] Invalid result from db:deleteUserDal task",
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

/**
 * Finds a user in the database.
 * @param email - User email.
 */
Cypress.Commands.add("findUser", (email: string) => {
	cy.log("Finding test user", email);
	return cy
		.task<DbTaskResult<UserEntity>>("db:findUser", email)
		.then((result) => {
			if (!result || typeof result !== "object" || !("success" in result)) {
				throw new Error("[findUser] Invalid result from db:findUser task");
			}
			const dbResult = result as DbTaskResult<UserEntity>;
			if (!(dbResult.success && dbResult.data)) {
				throw new Error(
					`[findUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
				);
			}
			cy.log("[findUser] dbResult =  ", dbResult);
			return cy.wrap(dbResult.data);
		});
});

/**
 * Logs in a user and persists the session using Cypress' cy.session.
 * @param user - User credentials.
 */
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

/**
 * Sets a mock session cookie for a user.
 * @param userId - User ID.
 * @param role - User role (default: "user").
 */
Cypress.Commands.add(
	"setMockSessionCookie",
	(userId: string, role: UserRole = "user") => {
		cy
			.then(() => {
				return generateMockSessionJwt(userId, role);
			})
			.then((token) => {
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

/**
 * Updates a user in the database.
 * @param email - User email.
 * @param updates - Partial user updates.
 */
Cypress.Commands.add(
	"updateUser",
	(email: string, updates: Partial<UserEntity>) => {
		cy.log("updateUser", email, updates);
		return cy
			.task<DbTaskResult<UserEntity>>("db:updateUser", { email, updates })
			.then((result) => {
				if (!result || typeof result !== "object" || !("success" in result)) {
					throw new Error("[updateUser] Invalid result from db:updateUser task");
				}
				const dbResult = result as DbTaskResult<UserEntity>;
				if (!(dbResult.success && dbResult.data)) {
					throw new Error(
						`[updateUser] ${dbResult.error ?? "Unknown error"}: ${dbResult.errorMessage ?? ""}`,
					);
				}
				cy.log("db:updateUser result", result);
				return dbResult.data;
			});
	},
);

// All commands are strictly typed in commands.d.ts

/**
 * TypeScript augmentation for custom Cypress commands.
 */
declare global {
	// biome-ignore lint/style/noNamespace: Cypress type augmentation
	namespace Cypress {
		interface Chainable {
			/**
			 * Logs in a user via the UI.
			 */
			login(user: LoginCredentials): Chainable<void>;

			/**
			 * Logs in a user via the UI and optionally asserts successful login.
			 */
			loginNew(
				user: LoginCredentials,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			/**
			 * Signs up a new user via the UI.
			 */
			signup(user: SignupUserInput): Chainable<void>;

			/**
			 * Creates a user in the database.
			 */
			createUser(user: CreateUserInput): Chainable<UserEntity>;

			/**
			 * Deletes a user from the database.
			 */
			deleteUser(email: string): Chainable<UserEntity>;

			/**
			 * Ensures a user is deleted from the database.
			 */
			ensureUserDeleted(email: string): Chainable<UserEntity | null>;

			/**
			 * Finds a user in the database.
			 */
			findUser(email: string): Chainable<UserEntity>;

			/**
			 * Logs in a user and persists the session.
			 */
			loginSession(user: UserCredentials): Chainable<void>;

			mount(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			mountV1(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			mountV2(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			/**
			 * Sets a mock session cookie for a user.
			 */
			setMockSessionCookie(userId: string, role?: UserRole): Chainable<void>;

			/**
			 * Updates a user in the database.
			 */
			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<UserEntity>;
		}
	}
}
