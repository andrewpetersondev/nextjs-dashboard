import "server-only";
import { asc, ilike, or } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/entity";
import { ITEMS_PER_PAGE_USERS } from "@/modules/users/domain/user.constants";
import { userDbRowToEntity } from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { users } from "@/server-core/db/schema/users";
import { AppError } from "@/shared/errors/core/app-error.class";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Fetches filtered users for a specific page.
 * Always maps raw DB rows to UserEntity, then to UserDto.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @param currentPage - Current page number (1-based).
 * @returns Array of UserDto for the page.
 */
export async function fetchFilteredUsers(
  db: AppDatabase,
  query: string,
  currentPage: number,
): Promise<UserEntity[]> {
  // Calculate offset using constant for items per page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE_USERS;
  try {
    // Fetch raw DB rows matching the query
    const userRows = await db
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

    // Map each raw row to UserEntity
    return userRows.map((row) => userDbRowToEntity(row));
  } catch (error) {
    logger.error("Failed to fetch filtered users", {
      context: "fetchFilteredUsers",
      currentPage,
      error,
      query,
    });
    throw new AppError("database", {
      message: "Failed to fetch filtered users.",
    });
  }
}
