import type { UserEntity } from "@/src/lib/db/entities/user";

/**
 * Credentials required for user login.
 * @property email - User's email address.
 * @property password - User's password.
 * @property username - User's username.
 */
export interface UserCredentials {
	email: string;
	password: string;
	username: string;
}

/**
 * Input type for creating a user in tests.
 * Omits id and sensitiveData from UserEntity.
 * Role is optional and compatible with UserEntity.
 */
export type CreateUserInput = Omit<UserEntity, "id" | "sensitiveData"> & {
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
	error?: string;
};

// Test user credentials
export const TEST_USER_CREDENTIALS: UserCredentials = {
	email: "test-login-session@example.com",
	password: "TestPassword123!",
	username: "testloginsession",
};

export const TEST_USER_DB: CreateUserInput = {
	...TEST_USER_CREDENTIALS,
	role: "user",
};
