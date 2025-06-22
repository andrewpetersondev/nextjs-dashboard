import { eq } from "drizzle-orm";
import type { UserEntity } from "@/src/lib/db/entities/user";
import { users } from "../../src/lib/db/schema";
import { testDB } from "../../src/lib/db/test-database";
import type { CreateUserInputV2, DbTaskResult } from "./types";

/**
 * Cypress database task handlers for E2E tests.
 * Keeps Cypress config clean and encapsulates all DB logic for test isolation.
 * All handlers return a standardized result for robust error handling in tests.
 */
export const dbTasks = {
	/**
	 * Creates a user in the test database.
	 * Always returns a result object with a valid user on success.
	 * On failure, returns a custom error result.
	 */
	"db:createUser": async (
		user: CreateUserInputV2,
	): Promise<DbTaskResult<UserEntity>> => {
		try {
			const [insertedUser] = await testDB
				.insert(users)
				.values(user)
				.returning();
			if (!insertedUser) {
				// Defensive: should not happen, but handle gracefully
				return {
					data: null,
					error: "USER_CREATION_FAILED",
					errorMessage: "User could not be created.",
					success: false,
				};
			}
			return { data: insertedUser, success: true };
		} catch (error) {
			// Log error for debugging in CI
			console.error("db:createUser error", error);
			return {
				data: null,
				error: "DB_ERROR",
				errorMessage: (error as Error).message,
				success: false,
			};
		}
	},

	/**
	 * Deletes a user from the test database by email.
	 * Returns the deleted user entity for confirmation.
	 * @param email - The user's email address.
	 * @returns The deleted user entity, or an error if not found.
	 */
	"db:deleteUser": async (email: string): Promise<DbTaskResult<UserEntity>> => {
		try {
			const [found] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			console.log("db:deleteUser found user", found);
			if (!found)
				return { data: null, error: "User not found", success: false };
			// Delete the user (delete() does not return the user)
			await testDB.delete(users).where(eq(users.id, found.id));
			// Return the previously found user as confirmation
			return { data: found, success: true };
		} catch (error) {
			console.error("db:deleteUser error", error);
			return { data: null, error: (error as Error).message, success: false };
		}
	},

	/**
	 * Finds a user in the test database by email.
	 * @param email - The user's email address.
	 * @returns The found user entity, or null if not found.
	 */
	"db:findUser": async (email: string): Promise<DbTaskResult<UserEntity>> => {
		try {
			const [user] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			console.log("db:findUser found user", user);
			return { data: user ?? null, success: !!user };
		} catch (error) {
			console.error("db:findUser error", error);
			return { data: null, error: (error as Error).message, success: false };
		}
	},

	/**
	 * Updates a user in the test database.
	 * @param params - Object containing the user's email and the updates to apply.
	 * @param params.email - The user's email address.
	 * @param params.updates - Partial user data to update.
	 * @returns The updated user entity, or an error if not found.
	 */
	"db:updateUser": async ({
		email,
		updates,
	}: {
		email: string;
		updates: Partial<UserEntity>;
	}): Promise<DbTaskResult<UserEntity>> => {
		try {
			const [found] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			console.log("db:updateUser found user", found);
			if (!found)
				return { data: null, error: "User not found", success: false };
			const [updatedUser] = await testDB
				.update(users)
				.set(updates)
				.where(eq(users.id, found.id))
				.returning();
			console.log("db:updateUser updated user", updatedUser);
			return { data: updatedUser ?? null, success: !!updatedUser };
		} catch (error) {
			console.error("db:updateUser error", error);
			return { data: null, error: (error as Error).message, success: false };
		}
	},

	/**
	 * Logs a message to the console for debugging in Cypress tasks.
	 * @param message - The message to log.
	 * @returns Always returns success.
	 */
	logToConsole: (message: string): DbTaskResult<null> => {
		console.log("log: ", message);
		return { data: null, success: true };
	},
};
