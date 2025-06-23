/// <reference types="cypress" />
/// <reference path="../cypress.d.ts" />

import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { JWT_EXPIRATION } from "../../src/lib/auth/constants";
import type { UserEntity } from "../../src/lib/db/entities/user";
import { users } from "../../src/lib/db/schema";
import { testDB } from "../../src/lib/db/test-database";
import type { UserRole } from "../../src/lib/definitions/enums";
import type { CreateUserInput, DbTaskResult } from "./types";

// Constants for session management
const _SESSION_COOKIE_NAME = "session";

// Error code constants for maintainability
const ERROR_USER_NOT_FOUND = "USER_NOT_FOUND";
const ERROR_USER_CREATION_FAILED = "USER_CREATION_FAILED";
const ERROR_DB = "DB_ERROR";
const ERROR_USER_UPDATE_FAILED = "USER_UPDATE_FAILED";
const ERROR_USER_DELETION_FAILED = "USER_DELETION_FAILED";

/**
 * Creates a user in the test database.
 * Used for backend setup, not for UI signup simulation.
 */
export async function createUserTask(
	user: CreateUserInput,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[createUserTask]...");
		const [insertedUser] = await testDB.insert(users).values(user).returning();
		if (!insertedUser) {
			return {
				data: null,
				error: ERROR_USER_CREATION_FAILED,
				errorMessage: "User could not be created.",
				success: false,
			};
		}
		console.log("[createUserTask] insertedUser = ", insertedUser);
		return { data: insertedUser, success: true };
	} catch (error) {
		console.error("[createUserTask] error = ", error);
		return {
			data: null,
			error: ERROR_DB,
			errorMessage: (error as Error).message,
			success: false,
		};
	}
}

/**
 * Deletes a user from the test database by email.
 */
export async function deleteUserTask(
	email: string,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[deleteUserTask]...");
		const [found] = await testDB
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!found) {
			return {
				data: null,
				error: ERROR_USER_NOT_FOUND,
				errorMessage: "User could not be found.",
				success: false,
			};
		}
		console.log("[deleteUserTask] [found] = ", found);
		const [deletedUser] = await testDB
			.delete(users)
			.where(eq(users.id, found.id))
			.returning();
		if (!deletedUser) {
			return {
				data: null,
				error: ERROR_USER_DELETION_FAILED,
				errorMessage: "User could not be deleted.",
				success: false,
			};
		}
		console.log("[deleteUserTask] [deletedUser] = ", deletedUser);
		return { data: deletedUser, success: true };
	} catch (error) {
		console.error("[deleteUserTask] error = ", error);
		return {
			data: null,
			error: ERROR_DB,
			errorMessage: (error as Error).message,
			success: false,
		};
	}
}

/**
 * Finds a user in the test database by email.
 */
export async function findUserTask(
	email: string,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[findUserTask]...");
		const [user] = await testDB
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!user) {
			return {
				data: null,
				error: ERROR_USER_NOT_FOUND,
				errorMessage: "User could not be found.",
				success: false,
			};
		}
		console.log("[findUserTask] user = ", user);
		return { data: user, success: true };
	} catch (error) {
		console.error("db:findUser error", error);
		return {
			data: null,
			error: ERROR_DB,
			errorMessage: (error as Error).message,
			success: false,
		};
	}
}

/**
 * Updates a user in the test database.
 */
export async function updateUserTask({
	email,
	updates,
}: {
	email: string;
	updates: Partial<UserEntity>;
}): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[updateUserTask]...");
		const [found] = await testDB
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!found) {
			return {
				data: null,
				error: ERROR_USER_NOT_FOUND,
				errorMessage: "User could not be found.",
				success: false,
			};
		}
		console.log("[updateUserTask] found = ", found);
		const [updatedUser] = await testDB
			.update(users)
			.set(updates)
			.where(eq(users.id, found.id))
			.returning();
		if (!updatedUser) {
			return {
				data: null,
				error: ERROR_USER_UPDATE_FAILED,
				errorMessage: "User could not be updated.",
				success: false,
			};
		}
		console.log("[updateUserTask] updatedUser = ", updatedUser);
		return { data: updatedUser, success: true };
	} catch (error) {
		console.error("db:updateUser error", error);
		return {
			data: null,
			error: ERROR_DB,
			errorMessage: (error as Error).message,
			success: false,
		};
	}
}

/**
 * Logs a message to the console for debugging in Cypress tasks.
 */
export function _logToConsoleTask(message: string): DbTaskResult<null> {
	console.log("log: ", message);
	return { data: null, success: true };
}

// Mock function to generate a session JWT for testing purposes
// takes in a userId and role, returns a JWT string
// this fn will eventually be replaced with a real JWT generation logic
// this fn will be used to get async/await out of custom command

/**
 * Generates a mock session JWT and serializes it as a cookie string.
 * @param userId - The user ID for the session.
 * @param role - The user role for the session.
 * @returns The serialized session cookie string.
 */
export async function _generateMockSessionJWT({
	userId,
	role,
}: {
	userId: string;
	role: UserRole;
}): Promise<string> {
	// TODO: Replace "mock-jwt" with real JWT generation logic as needed
	const jwtPayload = {
		user: {
			id: userId,
			role,
		},
	};
	const token = await new SignJWT(jwtPayload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(JWT_EXPIRATION)
		.sign("somekey1234567890"); // Replace with your actual secret key
	return token;
}

export const dbTasks = {
	"db:createUser": createUserTask,
	"db:deleteUser": deleteUserTask,
	"db:findUser": findUserTask,
	"db:updateUser": updateUserTask,
};
