import "server-only";

import { count, ilike, or } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { ITEMS_PER_PAGE_USERS } from "@/shared/ui/ui";

/**
 * Fetches the total number of user pages for pagination.
 * Always uses strict typing and constants.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @returns Number of pages as a number.
 */
export async function fetchUsersPages(
  db: Database,
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
    serverLogger.error({
      context: "fetchUsersPages",
      error,
      message: "Failed to fetch the total number of users.",
      query,
    });

    throw new DatabaseError(
      "Failed to fetch the total number of users.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
