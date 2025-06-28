/// <reference types="cypress" />

import type { MountOptions, MountReturn } from "cypress/react";
import type { ReactNode } from "react";
import type { UserEntity } from "../src/lib/db/entities/user.ts";
import type { UserRole } from "../src/lib/definitions/enums.ts";
import type {
	CreateUserInput,
	LoginCredentials,
	SignupUserInput,
	UserCredentials,
} from "./support/types.ts";

declare global {
	// biome-ignore lint/style/noNamespace: I think this is fine
	namespace Cypress {
		interface Chainable {
			createUser(user: CreateUserInput): Chainable<UserEntity>;

			deleteUser(email: string): Chainable<UserEntity>;

			ensureUserDeleted(email: string): Chainable<UserEntity | null>;

			findUser(email: string): Chainable<UserEntity>;

			login(user: LoginCredentials): Chainable<void>;

			loginNew(
				user: LoginCredentials,
				options?: { assertSuccess?: boolean },
			): Chainable<void>;

			loginSession(user: UserCredentials): Chainable<void>;

			mountV1(
				component: ReactNode,
				options?: Partial<MountOptions>,
			): Chainable<MountReturn>;

			mountV2: typeof mount;

			setMockSessionCookie(userId: string, role?: UserRole): Chainable<void>;

			signup(user: SignupUserInput): Chainable<void>;

			updateUser(
				email: string,
				updates: Partial<UserEntity>,
			): Chainable<UserEntity>;
		}
	}
}
