/// <reference types="../cypress" />
/// <reference path="../cypress.d.ts" />

import type { UserEntity } from "../../src/lib/db/entities/user";

// --- User Types ---
export interface BaseUserFields {
	email: string;
	password: string;
	username: string;
}

export type UserCredentials = BaseUserFields;
export type LoginCredentials = Pick<BaseUserFields, "email" | "password">;

export type CreateUserInput = BaseUserFields & {
	role?: UserEntity["role"];
};

export interface SignupUserInput extends BaseUserFields {}

// --- DB Task Result Type ---
export type DbTaskResult<T> = {
	success: boolean;
	data: T | null;
	errorMessage?: string;
	error?: string;
};

// --- Test User Constants ---
export const TEST_USER_CREDENTIALS: UserCredentials = {
	email: "sessionTest@example.com",
	password: "TestPassword123!",
	username: "sessionTest",
};

export const TEST_USER_DB: CreateUserInput = {
	...TEST_USER_CREDENTIALS,
	role: "user",
};
