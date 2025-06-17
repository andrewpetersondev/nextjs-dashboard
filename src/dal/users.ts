import "server-only";

/**
 * User Data Access Layer (DAL) for CRUD operations on User entities.
 * Uses Drizzle ORM for database access.
 */

import type { DB } from "@/src/db/connection";
import type { UserEntity } from "@/src/db/entities/user";
import { demoUserCounters, users } from "@/src/db/schema";
import type { UserDTO } from "@/src/dto/user.dto";
import type { UserRole } from "@/src/lib/definitions/roles";
import { comparePassword, hashPassword } from "@/src/lib/password";
import { createRandomPassword, logError } from "@/src/lib/utils.server";
import { toUserDTO } from "@/src/mappers/user.mapper";
import { asc, count, eq, ilike, or } from "drizzle-orm";

/**
 * Number of users to display per page for pagination.
 * Update this value to change pagination globally.
 */
const ITEMS_PER_PAGE_USERS = 10;

/**
 * Inserts a new user record into the database.
 * @param params - User creation parameters.
 * @returns The created user as UserDTO, or null if creation failed.
 * @param db
 */
export async function createUserInDB(
	db: DB,
	{
		username,
		email,
		password,
		role = "user",
	}: {
		username: string;
		email: string;
		password: string;
		role?: UserRole;
	},
): Promise<UserDTO | null> {
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
 * @param db - The database instance.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns The user as UserDTO, or null if not found or password invalid.
 */
export async function findUserForLogin(
	db: DB,
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
		return toUserDTO(user);
	} catch (error) {
		logError("findUserForLogin", error, { email });
		throw new Error("Failed to read user by email.");
	}
}

/**
 * Fetch a user by ID.
 * @param db - The database instance.
 * @param id - The user's ID.
 * @returns The user as UserDTO, or null if not found.
 */
export async function fetchUserById(
	db: DB,
	id: string,
): Promise<UserDTO | null> {
	try {
		const [user]: UserEntity[] = await db
			.select()
			.from(users)
			.where(eq(users.id, id));
		return user ? toUserDTO(user) : null;
	} catch (error) {
		logError("fetchUserById", error, { id });
		throw new Error("Failed to fetch user by id.");
	}
}

/**
 * Fetch all users, ordered by username.
 * @returns Array of UserDTO.
 * @remarks Not currently used.
 */
// export async function fetchUsers(): Promise<UserDTO[]> {
// 	try {
// 		const data: UserEntity[] = await db
// 			.select()
// 			.from(users)
// 			.orderBy(asc(users.username));
// 		return data.map(toUserDTO);
// 	} catch (error) {
// 		logError("fetchUsers", error, {});
// 		throw new Error("Failed to fetch users.");
// 	}
// }

/**
 * Fetch total user pages for pagination.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @returns Number of pages.
 */
export async function fetchUsersPages(db: DB, query: string): Promise<number> {
	try {
		const [{ count: total } = { count: 0 }] = await db
			.select({ count: count(users.id) })
			.from(users)
			.where(
				or(
					ilike(users.username, `%${query}%`),
					ilike(users.email, `%${query}%`),
				),
			);
		return Math.ceil(total / ITEMS_PER_PAGE_USERS);
	} catch (error) {
		logError("fetchUsersPages", error, { query });
		throw new Error("Failed to fetch the total number of users.");
	}
}

/**
 * Fetch filtered users for a page.
 *  @param db - The database instance.
 * @param query - Search query for username or email.
 * @param currentPage - Current page number.
 * @returns Array of UserDTO for the page.
 */
export async function fetchFilteredUsers(
	db: DB,
	query: string,
	currentPage: number,
): Promise<UserDTO[]> {
	const offset = (currentPage - 1) * ITEMS_PER_PAGE_USERS;
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
	} catch (error) {
		logError("fetchFilteredUsers", error, { query, currentPage });
		throw new Error("Failed to fetch filtered users.");
	}
}

/**
 * Deletes a user by ID.
 * @param db - The database instance.
 * @param userId - The user's ID.
 * @returns The deleted user as UserDTO, or null if not found.
 */
export async function deleteUser(
	db: DB,
	userId: string,
): Promise<UserDTO | null> {
	try {
		const [deletedUser]: UserEntity[] = await db
			.delete(users)
			.where(eq(users.id, userId))
			.returning();
		return deletedUser ? toUserDTO(deletedUser) : null;
	} catch (error) {
		logError("deleteUser", error, { userId });
		throw new Error("An unexpected error occurred. Please try again.");
	}
}

/**
 * Reads the demo-user counter for naming purposes.
 * @param db - The database instance.
 * @param role - User role.
 * @returns The counter ID.
 */
export async function demoUserCounter(db: DB, role: UserRole): Promise<number> {
	try {
		const [counter] = await db
			.insert(demoUserCounters)
			.values({ role, count: 1 })
			.returning();
		return counter.id;
	} catch (error) {
		logError("demoUserCounter", error, { role });
		throw new Error("Failed to read demo user counter.");
	}
}

/**
 * Creates a demo user with a unique username and email.
 * @param db - The database instance.
 * @param id - Unique identifier for the demo user.
 * @param role - User role.
 * @returns The created demo user as UserDTO, or null if creation failed.
 */
export async function createDemoUser(
	db: DB,
	id: number,
	role: UserRole,
): Promise<UserDTO | null> {
	try {
		const DEMO_PASSWORD = createRandomPassword();
		const uniqueEmail = `demo+${role}${id}@demo.com`;
		const uniqueUsername = `Demo_${role.toUpperCase()}_${id}`;
		return await createUserInDB(db, {
			username: uniqueUsername,
			email: uniqueEmail,
			password: DEMO_PASSWORD,
			role,
		});
	} catch (error) {
		logError("createDemoUser", error, { id, role });
		return null;
	}
}

/**
 * Retrieves a user from the database by ID.
 * @param db - The database instance.
 * @param id - The user's ID.
 * @returns The user as UserDTO, or null if not found.
 */
export async function readUserById(
	db: DB,
	id: string,
): Promise<UserDTO | null> {
	try {
		const [user]: UserEntity[] = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		return user ? toUserDTO(user) : null;
	} catch (error) {
		logError("readUserById", error, { id });
		throw new Error("Failed to read user by ID.");
	}
}

/**
 * Updates a user in the database with the provided patch.
 * @param db - The database instance.
 * @param id - The user's ID.
 * @param patch - An object containing the fields to update.
 * @returns The updated user as UserDTO, or null if no changes or update failed.
 * @example patch = { username: "john", age: 30, isActive: true }
 */
export async function updateUserDAL(
	db: DB,
	id: string,
	patch: Record<string, unknown>,
): Promise<UserDTO | null> {
	if (Object.keys(patch).length === 0) {
		// No changes to update; return null.
		return null;
	}
	try {
		const [user]: UserEntity[] = await db
			.update(users)
			.set(patch)
			.where(eq(users.id, id))
			.returning();
		// console.log("updateUserDAL", user);
		return user ? toUserDTO(user) : null;
	} catch (error) {
		logError("updateUserDAL", error, { id, patch });
		return null;
	}
}
