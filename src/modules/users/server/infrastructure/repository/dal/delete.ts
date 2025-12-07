import "server-only";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/entity";
import { userDbRowToEntity } from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { users } from "@/server-core/db/schema/users";
import type { UserId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";
import { logger } from "@/shared/logging/infrastructure/logging.client";

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
): Promise<UserEntity | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [deletedRow] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety
    return userDbRowToEntity(deletedRow);
  } catch (error) {
    logger.error("Failed to delete user.", {
      context: "deleteUserDal",
      error,
      userId,
    });
    throw new AppError("database", {
      message: "An unexpected error occurred. Please try again.",
    });
  }
}
