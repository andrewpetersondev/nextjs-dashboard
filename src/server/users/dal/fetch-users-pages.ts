import "server-only";
import { count, ilike, or } from "drizzle-orm";
import { ITEMS_PER_PAGE_USERS } from "@/features/users/lib/constants";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import { DatabaseError } from "@/shared/core/errors/domain/domain-errors";
import { logger } from "@/shared/logging/logger.shared";

/**
 * Fetches the total number of user pages for pagination.
 * Always uses strict typing and constants.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @returns Number of pages as a number.
 */
export async function fetchUsersPages(
  db: AppDatabase,
  query: string,
): Promise<number> {
  try {
    // Use Drizzle ORM to count users matching the query
    const [{ count: total } = { count: 0 }] = await db
      .select({ count: count(users.id) })
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.email, `%${query}%`),
        ),
      );

    // Defensive: Ensure total is a valid number
    // const totalUsers = typeof total === "number" ? total : 0;

    // total is always a number, so no need for typeof check
    const totalUsers = total ?? 0;

    return Math.ceil(totalUsers / ITEMS_PER_PAGE_USERS);
  } catch (error) {
    logger.error("Failed to fetch the total number of users.", {
      context: "fetchUsersPages",
      error,
      query,
    });

    throw new DatabaseError(
      "Failed to fetch the total number of users.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
