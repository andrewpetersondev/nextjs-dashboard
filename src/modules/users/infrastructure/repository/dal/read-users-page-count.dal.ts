import "server-only";
import { count, ilike, or } from "drizzle-orm";
import { ITEMS_PER_PAGE_USERS } from "@/modules/users/domain/constants/user.constants";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { normalizeUnknownError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Fetches the total number of user pages for pagination.
 * Always uses strict typing and constants.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @returns Number of pages as a number.
 */
export async function readUsersPageCountDal(
  db: AppDatabase,
  query: string,
): Promise<Result<number, AppError>> {
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

    return Ok(Math.ceil(totalUsers / ITEMS_PER_PAGE_USERS));
  } catch (error) {
    logger.error("Failed to fetch the total number of users.", {
      context: "fetchUsersPages",
      error,
      query,
    });

    return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
  }
}
