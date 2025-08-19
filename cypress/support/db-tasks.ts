import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema.ts";
import { nodeEnvTestDb } from "@/db/test-database.ts";
import type { UserEntity } from "@/features/users/user.entity.ts";
import { dbRowToUserEntity } from "@/features/users/user.mapper.ts";
import {
	ERROR_DB,
	ERROR_USER_CREATION_FAILED,
	ERROR_USER_DELETION_FAILED,
	ERROR_USER_NOT_FOUND,
	ERROR_USER_UPDATE_FAILED,
} from "./constants.ts";
import type { CreateUserInput, DbTaskResult } from "./types.ts";

/**
 * Creates a user in the test database.
 * Always maps raw DB row to UserEntity for strict typing.
 */
export async function createUserTask(
	user: CreateUserInput,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[createUserTask]...");
		const hashedPassword = await bcrypt.hash(user.password, 10);
		const [insertedUser] = await nodeEnvTestDb
			.insert(users)
			.values({ ...user, password: hashedPassword })
			.returning();
		if (!insertedUser) {
			return {
				data: null,
				error: ERROR_USER_CREATION_FAILED,
				errorMessage: "User could not be created.",
				success: false,
			};
		}
		// --- Map raw DB row to UserEntity ---
		const userEntity = dbRowToUserEntity(insertedUser);
		console.log("[createUserTask] insertedUser = ", userEntity);
		return { data: userEntity, success: true };
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
 * Deletes a user by email in the test database.
 * Always maps raw DB row to UserEntity for strict typing.
 */
export async function deleteUserTask(
	email: string,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[deleteUserTask]...");
		const [found] = await nodeEnvTestDb
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
		const [deletedUser] = await nodeEnvTestDb
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
		// --- Map raw DB row to UserEntity ---
		const userEntity = dbRowToUserEntity(deletedUser);
		console.log("[deleteUserTask] [deletedUser] = ", userEntity);
		return { data: userEntity, success: true };
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
 * Finds a user by email in the test database.
 * Always maps raw DB row to UserEntity for strict typing.
 */
export async function findUserTask(
	email: string,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[findUserTask]...");
		const [user] = await nodeEnvTestDb
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
		// --- Map raw DB row to UserEntity ---
		const userEntity = dbRowToUserEntity(user);
		console.log("[findUserTask] user = ", userEntity);
		return { data: userEntity, success: true };
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
 * Updates a user by email in the test database.
 * Always maps raw DB row to UserEntity for strict typing.
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
		const [found] = await nodeEnvTestDb
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
		const [updatedUser] = await nodeEnvTestDb
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
		// --- Map raw DB row to UserEntity ---
		const userEntity = dbRowToUserEntity(updatedUser);
		console.log("[updateUserTask] updatedUser = ", userEntity);
		return { data: userEntity, success: true };
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

// Export all db tasks for Cypress
export const dbTasks = {
	"db:createUser": createUserTask,
	"db:deleteUser": deleteUserTask,
	"db:findUser": findUserTask,
	"db:updateUser": updateUserTask,
};
