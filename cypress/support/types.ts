import type { UserEntity } from "../../src/lib/db/entities/user";

/**
 * Base fields required for user authentication and creation.
 */
export interface BaseUserFields {
	email: string;
	password: string;
	username: string;
}

/**
 * Credentials required for user login.
 * @extends BaseUserFields
 */
export type UserCredentials = BaseUserFields;

/**
 * @deprecated
 * Input type for creating a user in tests.
 * Omits id and sensitiveData from UserEntity.
 * Role is optional and compatible with UserEntity.
 */
export type CreateUserInput = Omit<UserEntity, "id" | "sensitiveData"> & {
	role?: UserEntity["role"];
};

/**
 * Input type for creating a user in tests.
 * Omits id and sensitiveData from UserEntity.
 * Role is optional and compatible with UserEntity.
 */
export type CreateUserInputV2 = BaseUserFields & {
	role?: UserEntity["role"];
};

/**
 * Generic result type for database tasks executed via Cypress.
 * @template T - The type of the data returned by the task.
 * @property success - Indicates if the operation was successful.
 * @property data - The result data, or null if unsuccessful.
 * @property error - Optional error message if the operation failed.
 */
export type DbTaskResult<T> = {
	success: boolean;
	data: T | null;
	errorMessage?: string;
	error?: string;
};

// Test user credentials
export const TEST_USER_CREDENTIALS: UserCredentials = {
	email: "sessionTest@example.com",
	password: "TestPassword123!",
	username: "sessionTest",
};

export const TEST_USER_DB: CreateUserInputV2 = {
	...TEST_USER_CREDENTIALS,
	role: "user",
};
