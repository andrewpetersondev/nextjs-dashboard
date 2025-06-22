import { eq } from "drizzle-orm";
import type { UserEntity } from "../../src/lib/db/entities/user";
import { users } from "../../src/lib/db/schema";
import { testDB } from "../../src/lib/db/test-database";
import type { CreateUserInput } from "./commands";

export type DbTaskResult<T> = {
	success: boolean;
	data: T | null;
	error?: string;
};

/**
 * Cypress database task handlers for e2e tests.
 * Keeps cypress.config.ts clean and maintainable.
 */
export const dbTasks = {
	"db:createUser": async (
		user: CreateUserInput,
	): Promise<DbTaskResult<UserEntity>> => {
		try {
			const [insertedUser] = await testDB
				.insert(users)
				.values(user)
				.returning();
			return { data: insertedUser ?? null, success: !!insertedUser };
		} catch (error) {
			console.error("db:createUser error", error);
			return { data: null, error: (error as Error).message, success: false };
		}
	},
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
			console.error("db:deleteUser error", error); // does not appear in terminal or cypress  so it must not run because it is successful
			return { data: null, error: (error as Error).message, success: false };
		}
	},
	"db:findUser": async (email: string): Promise<DbTaskResult<UserEntity>> => {
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
	},
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
			if (!found)
				return { data: null, error: "User not found", success: false };
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
	},
	logToConsole: (message: string): DbTaskResult<null> => {
		console.log("log: ", message);
		return { data: null, success: true };
	},
};
