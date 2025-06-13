import "server-only";

/**
 ** //  KEEP: User Data Access Layer (DAL) is responsible for interacting with the database to perform CRUD operations on User entities.
 */

import { db } from "@/src/db/database";
import type { UserEntity } from "@/src/db/entities/user";
import { users } from "@/src/db/schema";
import type { UserDTO } from "@/src/dto/user.dto";
import type { UserRole } from "@/src/lib/definitions/roles";
import { comparePassword, hashPassword } from "@/src/lib/password";
import { logError } from "@/src/lib/utils.server";
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
