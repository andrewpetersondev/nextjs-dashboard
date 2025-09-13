import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { userDbRowToEntity, userEntityToDto } from "@/server/users/mapper";
import type { UserId } from "@/shared/domain/domain-brands";
import type { UserDto } from "@/shared/users/dto/types";
import { users } from "../../../../node-only/schema/users";

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
    serverLogger.error({
      context: "deleteUserDal",
      error,
      message: "Failed to delete user.",
      userId,
    });
    throw new DatabaseError(
      "An unexpected error occurred. Please try again.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
