import "server-only";
import { eq } from "drizzle-orm";
import type { UserDto } from "@/features/users/lib/dto";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import {
  userDbRowToEntity,
  userEntityToDto,
} from "@/server/users/mapping/user.mappers";
import { DatabaseError } from "@/shared/core/errors/base-error.subclasses";
import type { UserId } from "@/shared/domain/domain-brands";
import { logger } from "@/shared/logging/logger.shared";

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
): Promise<UserDto | null> {
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
    const deletedEntity = userDbRowToEntity(deletedRow);

    // Map to DTO for safe return to client
    return userEntityToDto(deletedEntity);
  } catch (error) {
    logger.error("Failed to delete user.", {
      context: "deleteUserDal",
      error,
      userId,
    });
    throw new DatabaseError(
      "An unexpected error occurred. Please try again.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
