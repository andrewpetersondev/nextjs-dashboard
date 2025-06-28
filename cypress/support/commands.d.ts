/// <reference types="cypress" />

import type { UserEntity } from "../../src/lib/db/entities/user.ts";
import type { UserRole } from "../../src/lib/definitions/enums.ts";
import type {
    CreateUserInput,
    LoginCredentials,
    SignupUserInput,
    UserCredentials,
} from "./types.ts";

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

export {};
