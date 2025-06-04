import "server-only";
import { db } from "@/src/db/database";
import { users } from "@/src/db/schema";
import type { User } from "@/src/lib/definitions/users";
import { asc, count, eq, ilike, or } from "drizzle-orm";

/**
 * Fetch a user by ID.
 */
export async function fetchUserById(id: string): Promise<User | undefined> {
	try {
		const data = await db.select().from(users).where(eq(users.id, id));
		return data[0] as User | undefined;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch user by id.");
	}
}

/**
 * Fetch all users.
 */
export async function fetchUsers(): Promise<User[]> {
	try {
		const data = await db.select().from(users).orderBy(asc(users.username));
		return data as User[];
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch users.");
	}
}

/**
 * Fetch total user pages for pagination.
 */
export async function fetchUsersPages(query: string): Promise<number> {
	const ITEMS_PER_PAGE_USERS = 2;
	try {
		const data = await db
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
		const result = data[0].count;
		return Math.ceil(result / ITEMS_PER_PAGE_USERS);
	} catch (error) {
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
): Promise<User[]> {
	const ITEMS_PER_PAGE_USERS = 2;
	const offset = (currentPage - 1) * ITEMS_PER_PAGE_USERS;
	try {
		const data = await db
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
		return data as User[];
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch filtered users.");
	}
}
