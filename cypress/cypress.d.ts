/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import type { UserEntity } from "../src/lib/db/entities/user";
import type {
	CreateUserInput,
	SignupUserInput,
	UserCredentials,
} from "./support/types";

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Mounts a React component for component testing.
			 */
			mount(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			/**
			 * Logs in a user via the UI.
			 */
			login(
				user: LoginCredentials,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			/**
			 * Logs in a user and caches the session for fast, reliable authentication across tests.
			 * Uses Cypress session caching and validates session state.
			 * @param user - User credentials (email, password, username).
			 */
			loginSession(user: UserCredentials): Chainable<void>;

			/**
			 * Sets a valid mock session cookie for the given user.
			 * Only for use in Cypress E2E tests.
			 * @param userId - The user's unique identifier.
			 * @param role - The user's role (default: "user").
			 */
			setMockSessionCookie(userId: string, role?: UserRole): Chainable<void>;

			/**
			 * Signs up a user via the UI.
			 */
			signup(user: SignupUserInput): Chainable<void>;

			/**
			 * Creates a user in the test database.
			 * On success, returns the created user.
			 * On failure, throws an error with details.
			 * @param user - User data for creation.
			 */
			createUser(user: CreateUserInput): Chainable<UserEntity>;

			/**
			 * Finds a user in the test database by email.
			 * @param email - The user's email address.
			 */
			findUser(email: string): Chainable<UserEntity | null>;

			/**
			 * Updates a user in the test database.
			 * @param email - The user's email address.
			 * @param updates - Partial user data to update.
			 */
			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<string | null>;

			/**
			 * Deletes a user from the test database by email.
			 * @param email - The user's email address.
			 */
			deleteUser(email: string): Chainable<string | null>;

			/**
			 * Logs in a user via the login form using Cypress.
			 */
			loginNew(
				user: LoginCredentials,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			// /**
			//  * @deprecated Use setMockSessionCookie instead.
			//  * Sets a valid session cookie for the given user.
			//  * @param userId - The user's unique identifier.
			//  * @param role - The user's role.
			//  */
			// setSessionCookie(userId: string, role?: UserRole): Chainable<void>;
		}
	}
}
