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
	"db:insert": async (user: UserEntity) => {
		try {
			const [insertedUser] = await testDB
				.insert(users)
				.values(user)
				.returning();
			return insertedUser ? "User created" : "User creation failed";
		} catch (error) {
			console.error("db:insert error", error);
			return "User creation failed";
		}
	},
	"db:find": async (email: string) => {
		try {
			const [user] = await testDB
				.select()
				.from(users)
				.where(eq(users.email, email));
			return user ?? null;
		} catch (error) {
			console.error("db:find error", error);
			return null;
		}
	},
	"db:update": async ({
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
			console.error("db:update error", error);
			return "User update failed";
		}
	},
	"db:delete": async (email: string) => {
		try {
			const [found] = await testDB
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, email));
			if (!found) return "User not found";
			await testDB.delete(users).where(eq(users.id, found.id));
			return "User deleted";
		} catch (error) {
			console.error("db:delete error", error);
			return "User deletion failed";
		}
	},
};
