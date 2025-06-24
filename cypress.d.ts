/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import type { UserEntity } from "./src/lib/db/entities/user";
import type { UserRole } from "./src/lib/definitions/enums";
import type {
	CreateUserInput,
	LoginCredentials,
	SignupUserInput,
	UserCredentials,
} from "./cypress/support/types";

declare global {
	namespace Cypress {
		interface Chainable {
			mount(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			login(user: LoginCredentials): Chainable<void>;

			loginNew(
				user: LoginCredentials,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			loginSession(user: UserCredentials): Chainable<void>;

			setMockSessionCookie(userId: string, role?: UserRole): Chainable<void>;

			signup(user: SignupUserInput): Chainable<void>;

			createUser(user: CreateUserInput): Chainable<UserEntity>;

			deleteUser(email: string): Chainable<UserEntity>;

			ensureUserDeleted(email: string): Chainable<UserEntity | null>;

			findUser(email: string): Chainable<UserEntity>;

			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<UserEntity>;
		}
	}
}
