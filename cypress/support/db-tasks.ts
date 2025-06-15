/// <reference types="../cypress.d.ts" />
/// <reference types="cypress" />

import { eq } from "drizzle-orm";
import type { UserEntity } from "../../src/db/entities/user";
import { users } from "../../src/db/schema";
import { testDB } from "../../src/db/test-database";

/**
 * Cypress database task handlers for e2e tests.
 * Keeps cypress.config.ts clean and maintainable.
 */
export const dbTasks = {
	logToConsole: (message: string) => {
		console.log("log: ", message);
		return null;
	},
	"db:createUser": async (user: UserEntity) => {
		try {
			const [insertedUser] = await testDB
				.insert(users)
				.values(user)
				.returning();
			return insertedUser ?? null;
		} catch (error) {
			console.error("db:createUser error", error);
			return null;
		}
	},
	"db:findUser": async (email: string) => {
		try {
			const [user] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			return user ?? null;
		} catch (error) {
			console.error("db:findUser error", error);
			return null;
		}
	},
	"db:updateUser": async ({
		email,
		updates,
	}: {
		email: string;
		updates: Partial<UserEntity>;
	}) => {
		try {
			const [found] = await testDB
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, email));
			if (!found) return "User not found";
			const [updatedUser] = await testDB
				.update(users)
				.set(updates)
				.where(eq(users.id, found.id))
				.returning();
			return updatedUser ? "User updated" : "User update failed";
		} catch (error) {
			console.error("db:updateUser error", error);
			return "User update failed";
		}
	},
	"db:deleteUser": async (email: string) => {
		try {
			const [found] = await testDB
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, email));
			if (!found) return "User not found";
			await testDB.delete(users).where(eq(users.id, found.id));
			return "User deleted";
		} catch (error) {
			console.error("db:deleteUser error", error);
			return "User deletion failed";
		}
	},
};
