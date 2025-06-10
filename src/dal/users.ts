import "server-only";
import { db } from "@/src/db/database";
import type { UserEntity } from "@/src/db/entities/user";
import { users } from "@/src/db/schema";
import type { UserDTO } from "@/src/dto/user.dto";
import { toUserDTO } from "@/src/mappers/user.mapper";
import { asc, count, eq, ilike, or } from "drizzle-orm";

/**
 * Fetch a user by ID and return a safe UserDTO.
 */
export async function fetchUserById(id: string): Promise<UserDTO | null> {
	try {
		const data: UserEntity[] = await db
			.select()
			.from(users)
			.where(eq(users.id, id));
		const user = data[0] as UserEntity | undefined;
		return user ? toUserDTO(user) : null;
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch user by id.");
	}
}

/**
 * Fetch all users.
 */
export async function fetchUsers(): Promise<UserEntity[]> {
	try {
		const data: UserEntity[] = await db
			.select()
			.from(users)
			.orderBy(asc(users.username));
		return data as UserEntity[];
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
): Promise<UserEntity[]> {
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
		return data as UserEntity[];
	} catch (error: unknown) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch filtered users.");
	}
}
