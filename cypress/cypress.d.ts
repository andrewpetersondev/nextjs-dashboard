/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import type { UserEntity } from "@/src/lib/db/entities/user";

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Mount a React component.
			 */
			mount(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			/**
			 * Log in a user via UI.
			 */
			login(
				user: Pick<UserEntity, "email" | "password" | "username">,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			/**
			 * Sign up a user via UI.
			 */
			signup(
				user: Pick<UserEntity, "email" | "password" | "username">,
			): Chainable<void>;

			/**
			 * Create a user in the DB.
			 */
			createUser(user: UserEntity): Chainable<string>;

			/**
			 * Find a user in the DB.
			 */
			findUser(email: string): Chainable<UserEntity | null>;

			/**
			 * Update a user in the DB.
			 */
			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<string>;

			/**
			 * Delete a user from the DB.
			 */
			deleteUser(email: string): Chainable<string>;

			/**
			 * Log in a user via UI (new implementation).
			 * @param user - User credentials
			 * @param options - Optional assertion
			 */
			loginNew(
				user: Pick<UserEntity, "email" | "password" | "username">,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;
		}
	}
}
