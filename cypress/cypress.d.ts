/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import type { UserEntity } from "../src/lib/db/entities/user";
import type { CreateUserInput, UserCredentials } from "./support/types";

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Mounts a React component for component testing.
			 * @param component - The React node to mount.
			 * @param options - Optional mount configuration.
			 * @returns Chainable containing the mount result.
			 * @example
			 *   cy.mount(<MyComponent />);
			 */
			mount(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			/**
			 * Logs in a user via the UI using the provided credentials.
			 * @param user - User credentials (email, password, username).
			 * @param options - Optional settings (e.g., assertSuccess to verify dashboard redirect).
			 * @returns Chainable<void>
			 * @example
			 *   cy.login({ email, password, username }, { assertSuccess: true });
			 */
			login(
				user: Pick<UserEntity, "email" | "password" | "username">,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			/**
			 * Logs in a user and caches the session for fast, reliable authentication across tests.
			 * Uses Cypress session caching and validates session state.
			 * @param user - User credentials (email, password, username).
			 * @returns Chainable<void>
			 * @example
			 *   cy.loginSession({ email, password, username });
			 */
			loginSession(user: UserCredentials): Chainable<void>;

			/**
			 * Sets a valid mock session cookie for the given user.
			 * Only for use in Cypress E2E tests.
			 * @param userId - The user's unique identifier.
			 * @param role - The user's role (default: "user").
			 * @returns Chainable<void>
			 * @example
			 *   cy.setMockSessionCookie("user-123", "admin");
			 */
			setMockSessionCookie(userId: string, role?: UserRole): Chainable<void>;

			/**
			 * Signs up a user via the UI.
			 * @param user - User credentials (email, password, username).
			 * @returns Chainable<void>
			 * @example
			 *   cy.signup({ email, password, username });
			 */
			signup(
				user: Pick<UserEntity, "email" | "password" | "username">,
			): Chainable<void>;

			/**
			 * Creates a user in the test database.
			 * @param user - User data for creation.
			 * @returns Chainable<UserEntity> Resolves to the created user object.
			 * @throws an error if creation fails.
			 * @example
			 *   cy.createUser({ email, password, username, ... });
			 */
			createUser(user: CreateUserInput): Chainable<UserEntity>;

			/**
			 * Finds a user in the test database by email.
			 * @param email - The user's email address.
			 * @returns Chainable<UserEntity | null> Resolves to the found user or null if not found.
			 * @example
			 *   cy.findUser("test@example.com");
			 */
			findUser(email: string): Chainable<UserEntity | null>;

			/**
			 * Updates a user in the test database.
			 * @param email - The user's email address.
			 * @param updates - Partial user data to update.
			 * @returns Chainable<string | null> Resolves to the updated user's email or null if not found.
			 * @example
			 *   cy.updateUser("test@example.com", { username: "newName" });
			 */
			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<string | null>;

			/**
			 * Deletes a user from the test database by email.
			 * @param email - The user's email address.
			 * @returns Chainable<string | null> Resolves to the deleted user's email or null if not found.
			 * @example
			 *   cy.deleteUser("test@example.com");
			 */
			deleteUser(email: string): Chainable<string | null>;

			/**
			 * Logs in a user via the login form using Cypress.
			 * Designed for Next.js App Router (v15+) with strict typing and best practices.
			 * Hides password from Cypress logs for security.
			 * @param user - User credentials (email, password, username).
			 * @param options - Optional settings (e.g., assertSuccess to verify dashboard redirect).
			 * @returns Chainable<void>
			 * @example
			 *   cy.loginNew({ email, password, username }, { assertSuccess: true });
			 */
			loginNew(
				user: Pick<UserEntity, "email" | "password" | "username">,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			/**
			 * @deprecated Use setMockSessionCookie instead.
			 * Sets a valid session cookie for the given user.
			 * @param userId - The user's unique identifier.
			 * @param role - The user's role.
			 */
			// setSessionCookie(userId: string, role?: UserRole): Chainable<void>;
		}
	}
}
