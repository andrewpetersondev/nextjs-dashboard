import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { UserEntity } from "../../src/lib/db/entities/user.ts";
import { users } from "../../src/lib/db/schema.ts";
import { testDB } from "../../src/lib/db/test-database.ts";
import {
	ERROR_DB,
	ERROR_USER_CREATION_FAILED,
	ERROR_USER_DELETION_FAILED,
	ERROR_USER_NOT_FOUND,
	ERROR_USER_UPDATE_FAILED,
} from "./constants.ts";
import type { CreateUserInput, DbTaskResult } from "./types.ts";

export async function createUserTask(
	user: CreateUserInput,
): Promise<DbTaskResult<UserEntity>> {
	try {
		console.log("[createUserTask]...");
		const hashedPassword = await bcrypt.hash(user.password, 10);
		const [insertedUser] = await testDB
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

export const dbTasks = {
	"db:createUser": createUserTask,
	"db:deleteUser": deleteUserTask,
	"db:findUser": findUserTask,
	"db:updateUser": updateUserTask,
};
