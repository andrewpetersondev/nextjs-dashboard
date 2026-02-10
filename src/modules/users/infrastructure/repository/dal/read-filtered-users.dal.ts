import "server-only";
import { asc, ilike, or } from "drizzle-orm";
import { ITEMS_PER_PAGE_USERS } from "@/modules/users/domain/constants/user.constants";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Fetches filtered users for a specific page.
 * Always maps raw DB rows to UserEntity, then to UserDto.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @param currentPage - Current page number (1-based).
 * @returns Array of UserDto for the page.
 */
export async function readFilteredUsersDal(
  db: AppDatabase,
  query: string,
  currentPage: number,
): Promise<Result<UserEntity[], AppError>> {
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
    return Ok(userRows.map((row) => toUserEntity(row)));
  } catch (error) {
    logger.error("Failed to fetch filtered users", {
      context: "fetchFilteredUsers",
      currentPage,
      error,
      query,
    });
    return Err(normalizeUnknownToAppError(error, APP_ERROR_KEYS.database));
  }
}
