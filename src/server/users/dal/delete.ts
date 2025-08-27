import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import { DatabaseError_New } from "@/server/errors/infrastructure";
import { logger } from "@/server/logging/logger";
import type { UserDto } from "@/server/users/dto";
import { userDbRowToEntity, userEntityToDto } from "@/server/users/mapper";
import type { UserId } from "@/shared/brands/domain-brands";

/**
 * Deletes a user by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param userId - UserId (branded)
 * @returns UserDto if deleted, otherwise null
 */
export async function deleteUserDal(
  db: Database,
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
    logger.error({
      context: "deleteUserDal",
      error,
      message: "Failed to delete user.",
      userId,
    });
    throw new DatabaseError_New(
      "An unexpected error occurred. Please try again.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
