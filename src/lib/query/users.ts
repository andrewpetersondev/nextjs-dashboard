import "server-only";

import { db } from "@/src/db/database";
import { users } from "@/src/db/schema";
import { asc, count, eq, ilike, or } from "drizzle-orm";

export async function fetchUserById(id: string) {
	try {
		const data = await db.select().from(users).where(eq(users.id, id));
		const user = data[0];
		return user;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch user by id.");
	}
}

export async function fetchUsers() {
	try {
		const data = await db.select().from(users).orderBy(asc(users.username));
		return data;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch users.");
	}
}

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
		const totalPages = Math.ceil(result / ITEMS_PER_PAGE_USERS);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch the total number of users.");
	}
}

export async function fetchFilteredUsers(query: string, currentPage: number) {
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
		return data;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch filtered users.");
	}
}
