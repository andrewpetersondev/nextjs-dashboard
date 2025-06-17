/// <reference types="../cypress.d.ts" />
/// <reference types="../cypress" />

import { eq } from "drizzle-orm";
import { createUserInDB } from "../../src/dal/users";
import { getDB } from "../../src/db/connection";
import type { UserEntity } from "../../src/db/entities/user";
import { users } from "../../src/db/schema";
import type { UserRole } from "../../src/lib/definitions/roles";
import type {
	DecryptPayload,
	EncryptPayload,
} from "../../src/lib/definitions/session";
import {
	createSession,
	decrypt,
	deleteSession,
	encrypt,
} from "../../src/lib/session";

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
	logToConsole: (message: string): DbTaskResult<null> => {
		console.log("log: ", message);
		return { success: true, data: null };
	},
	"db:createUser": async (
		user: UserEntity,
	): Promise<DbTaskResult<UserEntity>> => {
		try {
			const testDB = getDB("test");
			const insertedUser = await createUserInDB(testDB, {
				username: user.username,
				email: user.email,
				password: user.password,
				role: user.role,
			});
			return { success: !!insertedUser, data: insertedUser ?? null };
		} catch (error) {
			console.error("db:createUser error", error);
			return { success: false, data: null, error: (error as Error).message };
		}
	},
	"db:findUser": async (email: string): Promise<DbTaskResult<UserEntity>> => {
		try {
			const testDB = getDB("test");
			const [user] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			return { success: !!user, data: user ?? null };
		} catch (error) {
			console.error("db:findUser error", error);
			return { success: false, data: null, error: (error as Error).message };
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
			const testDB = getDB("test");
			const [found] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			if (!found)
				return { success: false, data: null, error: "User not found" };
			const [updatedUser] = await testDB
				.update(users)
				.set(updates)
				.where(eq(users.id, found.id))
				.returning();
			return { success: !!updatedUser, data: updatedUser ?? null };
		} catch (error) {
			console.error("db:updateUser error", error);
			return { success: false, data: null, error: (error as Error).message };
		}
	},
	"db:deleteUser": async (email: string): Promise<DbTaskResult<UserEntity>> => {
		try {
			const testDB = getDB("test");
			const [found] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			console.log("db:deleteUser found user", found);
			if (!found)
				return { success: false, data: null, error: "User not found" };
			// Delete the user (delete() does not return the user)
			await testDB.delete(users).where(eq(users.id, found.id));
			// Return the previously found user as confirmation
			return { success: true, data: found };
		} catch (error) {
			console.error("db:deleteUser error", error); // does not appear in terminal or cypress  so it must not run because it is successful
			return { success: false, data: null, error: (error as Error).message };
		}
	},
	"session:create": async (
		userId: string,
		role: UserRole = "user",
	): Promise<void> => {
		try {
			await createSession(userId, role);
		} catch (error) {
			console.error("session:create error", error);
		}
	},
	"session:encrypt:": async (payload: EncryptPayload): Promise<string> => {
		try {
			const encrypted = await encrypt(payload);
			return encrypted;
		} catch (error) {
			console.error("session:encrypt error", error);
			throw new Error("Failed to encrypt session payload.");
		}
	},
	"session:decrypt": async (
		session: string,
	): Promise<DecryptPayload | undefined> => {
		try {
			const decrypted = await decrypt(session);
			return decrypted;
		} catch (error) {
			console.error("session:decrypt error", error);
			throw new Error("Failed to decrypt session payload.");
		}
	},
	"session:delete": async (): Promise<void> => {
		try {
			await deleteSession();
		} catch (error) {
			console.error("session:delete error", error);
			throw new Error("Failed to delete session cookie.");
		}
	},
};
