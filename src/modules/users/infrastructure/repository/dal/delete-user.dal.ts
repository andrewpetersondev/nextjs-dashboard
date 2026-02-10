import "server-only";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { UserId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Deletes a user by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param userId - UserId (branded)
 * @returns UserDto if deleted, otherwise null
 */
export async function deleteUserDal(
  db: AppDatabase,
  userId: UserId, // Use branded UserId for strict typing
): Promise<Result<UserEntity | null, AppError>> {
  try {
    // Fetch raw DB row, not UserEntity
    const [deletedRow] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedRow) {
      return Ok(null);
    }

    // Map raw DB row to UserEntity for type safety
    return Ok(toUserEntity(deletedRow));
  } catch (error) {
    logger.error("Failed to delete user.", {
      context: "deleteUserDal",
      error,
      userId,
    });
    return Err(normalizeUnknownToAppError(error, APP_ERROR_KEYS.database));
  }
}
