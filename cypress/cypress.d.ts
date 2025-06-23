/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import type { UserEntity } from "../src/lib/db/entities/user";
import type {
	CreateUserInput,
	LoginCredentials,
	SignupUserInput,
	UserCredentials,
} from "./support/types";
import type { UserRole } from "../src/lib/definitions/enums";

declare global {
	namespace Cypress {
		interface Chainable {
			// --- Component Mounting ---
			/**
			 * Mounts a React component for component testing.
			 * @param component - The React component to mount.
			 * @param options - Optional mount options.
			 * @returns Chainable<MountReturn>
			 */
			mount(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			// --- Authentication ---
			/**
			 * Logs in a user via the UI.
			 * @param user - Login credentials.
			 * @returns Chainable<void>
			 */
			login(user: LoginCredentials): Chainable<void>;

			/**
			 * Logs in a user via the login form using Cypress.
			 * @param user - Login credentials.
			 * @param options - Optional options (e.g., assertSuccess).
			 * @returns Chainable<void>
			 */
			loginNew(
				user: LoginCredentials,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			/**
			 * Logs in a user and caches the session for fast, reliable authentication across tests.
			 * Uses Cypress session caching and validates session state.
			 * @param user - User credentials (email, password, username).
			 * @returns Chainable<void>
			 */
			loginSession(user: UserCredentials): Chainable<void>;

			/**
			 * Sets a valid mock session cookie for the given user.
			 * Only for use in Cypress E2E tests.
			 * @param userId - The user's unique identifier.
			 * @param role - The user's role (default: "user").
			 * @returns Chainable<void>
			 */
			setMockSessionCookie(userId: string, role?: UserRole): Chainable<void>;

			/**
			 * Signs up a user via the UI.
			 * @param user - Signup input.
			 * @returns Chainable<void>
			 */
			signup(user: SignupUserInput): Chainable<void>;

			// --- User Management ---
			/**
			 * Creates a user in the test database.
			 * On success, returns the created user.
			 * On failure, throws an error with details.
			 * @param user - User data for creation.
			 * @returns Chainable<UserEntity>
			 */
			createUser(user: CreateUserInput): Chainable<UserEntity>;

			/**
			 * Deletes a user from the test database by email.
			 * @param email - The user's email address.
			 * @returns Chainable<UserEntity>
			 */
			deleteUser(email: string): Chainable<UserEntity>;

			/**
			 * Ensures a user is deleted from the test database by email.
			 * @param email - The user's email address.
			 * @returns Chainable<UserEntity | null>
			 */
			ensureUserDeleted(email: string): Chainable<UserEntity | null>;

			/**
			 * Finds a user in the test database by email.
			 * @param email - The user's email address.
			 * @returns Chainable<UserEntity>
			 */
			findUser(email: string): Chainable<UserEntity>;

			/**
			 * Updates a user in the test database.
			 * @param email - The user's email address.
			 * @param updates - Partial user data to update.
			 * @returns Chainable<UserEntity>
			 */
			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<UserEntity>;
		}
	}
}
