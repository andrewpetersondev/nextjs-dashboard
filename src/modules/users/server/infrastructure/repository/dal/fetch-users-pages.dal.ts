import "server-only";

import { count, ilike, or } from "drizzle-orm";
import { ITEMS_PER_PAGE_USERS } from "@/modules/users/domain/user.constants";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Fetches the total number of user pages for pagination.
 * Always uses strict typing and constants.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @returns Number of pages as a number.
 */
export async function fetchUsersPagesDal(
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

    throw makeAppError(APP_ERROR_KEYS.database, {
      cause: "",
      message: "Failed to fetch the total number of users.",
      metadata: {},
    });
  }
}
