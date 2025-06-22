import { eq } from "drizzle-orm";
import type { UserEntity } from "@/src/lib/db/entities/user";
import { users } from "../../src/lib/db/schema";
import { testDB } from "../../src/lib/db/test-database";
import type { CreateUserInput, DbTaskResult } from "./types";

// Error code constants for maintainability
const ERROR_USER_NOT_FOUND = "USER_NOT_FOUND";
const ERROR_USER_CREATION_FAILED = "USER_CREATION_FAILED";
const ERROR_DB = "DB_ERROR";

/**
 * Creates a user in the test database.
 */
export async function createUserTask(
	user: CreateUserInput,
): Promise<DbTaskResult<UserEntity>> {
	try {
		const [insertedUser] = await testDB.insert(users).values(user).returning();
		if (!insertedUser) {
			return {
				data: null,
				error: ERROR_USER_CREATION_FAILED,
				errorMessage: "User could not be created.",
				success: false,
			};
		}
		return { data: insertedUser, success: true };
	} catch (error) {
		console.error("db:createUser error", error);
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
		const [found] = await testDB
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!found) {
			return { data: null, error: ERROR_USER_NOT_FOUND, success: false };
		}
		await testDB.delete(users).where(eq(users.id, found.id));
		return { data: found, success: true };
	} catch (error) {
		console.error("db:deleteUser error", error);
		return { data: null, error: (error as Error).message, success: false };
	}
}

/**
 * Finds a user in the test database by email.
 */
export async function findUserTask(
	email: string,
): Promise<DbTaskResult<UserEntity>> {
	try {
		const [user] = await testDB
			.select()
			.from(users)
			.where(eq(users.email, email));
		return { data: user ?? null, success: !!user };
	} catch (error) {
		console.error("db:findUser error", error);
		return { data: null, error: (error as Error).message, success: false };
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
		const [found] = await testDB
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!found) {
			return { data: null, error: ERROR_USER_NOT_FOUND, success: false };
		}
		const [updatedUser] = await testDB
			.update(users)
			.set(updates)
			.where(eq(users.id, found.id))
			.returning();
		return { data: updatedUser ?? null, success: !!updatedUser };
	} catch (error) {
		console.error("db:updateUser error", error);
		return { data: null, error: (error as Error).message, success: false };
	}
}

/**
 * Logs a message to the console for debugging in Cypress tasks.
 */
export function logToConsoleTask(message: string): DbTaskResult<null> {
	console.log("log: ", message);
	return { data: null, success: true };
}

// Compose all tasks into a single export for Cypress task registration
export const dbTasks = {
	"db:createUser": createUserTask,
	"db:deleteUser": deleteUserTask,
	"db:findUser": findUserTask,
	"db:updateUser": updateUserTask,
	logToConsole: logToConsoleTask,
};
