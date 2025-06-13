import "server-only";

/**
 ** //  KEEP: User Data Access Layer (DAL) is responsible for interacting with the database to perform CRUD operations on User entities.
 */

import { db } from "@/src/db/database";
import type { UserEntity } from "@/src/db/entities/user";
import { demoUserCounters, users } from "@/src/db/schema";
import type { UserDTO } from "@/src/dto/user.dto";
import type { UserRole } from "@/src/lib/definitions/roles";
import { comparePassword, hashPassword } from "@/src/lib/password";
import { createRandomPassword, logError } from "@/src/lib/utils.server";
import { toUserDTO } from "@/src/mappers/user.mapper";
import { asc, count, eq, ilike, or } from "drizzle-orm";

/**
 * Inserts a new user record into the database.
 * @returns UserDTO | null
 */
export async function createUserInDB({
	username,
	email,
	password,
	role = "user",
}: {
	username: string;
	email: string;
	password: string;
	role?: UserRole;
}): Promise<UserDTO | null> {
	try {
		const hashedPassword = await hashPassword(password);
		const [user] = await db
			.insert(users)
			.values({ username, email, password: hashedPassword, role })
			.returning();
		return user ? toUserDTO(user) : null;
	} catch (error) {
		logError("createUserInDB", error, { email });
		throw new Error("Failed to create user in database.");
	}
}

/**
 * Fetch a user by login credentials (email and password).
 * @param email - The user's email address.
 * @param password - The user's password.
 * @return A UserDTO | null.
 */
export async function findUserForLogin(
	email: string,
	password: string,
): Promise<UserDTO | null> {
	if (!email || !password) {
		return null;
	}
	try {
		const [user]: UserEntity[] = await db
			.select()
			.from(users)
			.where(eq(users.email, email));
		if (!user) {
			return null;
		}
		const validPassword = await comparePassword(password, user.password);
		if (!validPassword) {
			return null;
		}
		return user ? toUserDTO(user) : null;
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to read user by email.");
	}
}

/**
 * Fetch a user by ID
 * @param id - The user's ID.
 * @return A UserDTO | null.
 */
export async function fetchUserById(id: string): Promise<UserDTO | null> {
	try {
		const data: UserEntity[] = await db
			.select()
			.from(users)
			.where(eq(users.id, id));
		const user: UserEntity = data[0];
		return user ? toUserDTO(user) : null;
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch user by id.");
	}
}

/**
 * Fetch all users.
 * Ignore for now, not being used...
 */
export async function fetchUsers(): Promise<UserDTO[]> {
	try {
		const data: UserEntity[] = await db
			.select()
			.from(users)
			.orderBy(asc(users.username));
		return data.map(toUserDTO);
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch users.");
	}
}

/**
 * Fetch total user pages for pagination.
 */
export async function fetchUsersPages(query: string): Promise<number> {
	const ITEMS_PER_PAGE_USERS: number = 2;
	try {
		const data: { count: number }[] = await db
			.select({
				count: count(users.id),
			})
			.from(users)
			.where(
				or(
					ilike(users.username, `%${query}%`),
					ilike(users.email, `%${query}%`),
				),
			);
		const result: number = data[0].count;
		return Math.ceil(result / ITEMS_PER_PAGE_USERS);
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch the total number of users.");
	}
}

/**
 * Fetch filtered users for a page.
 */
export async function fetchFilteredUsers(
	query: string,
	currentPage: number,
): Promise<UserDTO[]> {
	const ITEMS_PER_PAGE_USERS: number = 2;

	const offset: number = (currentPage - 1) * ITEMS_PER_PAGE_USERS;

	try {
		const data: UserEntity[] = await db
			.select()
			.from(users)
			.where(
				or(
					ilike(users.username, `%${query}%`),
					ilike(users.email, `%${query}%`),
				),
			)
			.orderBy(asc(users.username))
			.limit(ITEMS_PER_PAGE_USERS)
			.offset(offset);

		return data.map(toUserDTO);
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch filtered users.");
	}
}

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUser(userId: string): Promise<UserDTO | null> {
	try {
		const [deletedUser]: UserEntity[] = await db
			.delete(users)
			.where(eq(users.id, userId))
			.returning();
		if (!deletedUser) {
			return null;
		}
		return deletedUser ? toUserDTO(deletedUser) : null;
	} catch (error) {
		logError("deleteUser", error, { userId });
		throw new Error("An unexpected error occurred. Please try again.");
	}
}

/**
 * Reads the demo-user counter for naming purposes.
 */
export async function demoUserCounter(role: UserRole): Promise<number> {
	try {
		const [counter] = await db
			.insert(demoUserCounters)
			.values({ role, count: 1 })
			.returning();
		// console.log(counter); // returns { id: 53, role: 'admin', count: 1 }
		return counter.id;
	} catch (error) {
		logError("demoUserCounter", error, {});
		throw new Error("Failed to read demo user counter.");
	}
}

/**
 * Creates a demo user with a unique username and email based on the provided ID.
 */
export async function createDemoUser(
	id: number,
	role: UserRole,
): Promise<UserDTO | null> {
	try {
		const DEMO_PASSWORD = createRandomPassword();
		const uniqueEmail = `demo+${role}${id}@demo.com`;
		const uniqueUsername = `Demo_${role.toUpperCase()}_${id}`;
		const user: UserDTO | null = await createUserInDB({
			username: uniqueUsername,
			email: uniqueEmail,
			password: DEMO_PASSWORD,
			role,
		});
		if (!user) {
			return null;
		}
		return user ? user : null;
	} catch (error) {
		logError("createDemoUser", error, {});
		return null;
	}
}

/**
 * This function retrieves a user from the database based on their ID.
 * @param id - The user's ID.
 * @return A UserDTO | null.
 */
export async function readUserById(id: string): Promise<UserDTO | null> {
	try {
		const data: UserEntity[] = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		const user: UserEntity = data[0];
		// console.log("readUserById", user);
		// console.log("toUserDTO", toUserDTO(user));
		return user ? toUserDTO(user) : null;
	} catch (error: unknown) {
		logError("readUserById", error, { id });
		throw new Error("Failed to read user by ID.");
	}
}

/**
 * Updates a user in the database with the provided patch.
 * @param id - The user's ID.
 * @param patch - An object containing the fields to update.
 * @return A UserDTO | null.
 * Record<string, unknown> is ALWAYS shaped like an object
 * @example Record<string, unknown> = { username: "john", age: 30, isActive: true }
 */
export async function updateUserDAL(
	id: string,
	patch: Record<string, unknown>,
): Promise<UserDTO | null> {
	if (Object.keys(patch).length === 0) {
		return null;
	}
	try {
		const update: UserEntity[] = await db
			.update(users)
			.set(patch)
			.where(eq(users.id, id))
			.returning();
		const user: UserEntity = update[0];
		console.log("updateUserDAL", user);
		return user ? toUserDTO(user) : null;
	} catch (error: unknown) {
		logError("updateUserDAL", error, { id, patch });
		return null;
	}
}
