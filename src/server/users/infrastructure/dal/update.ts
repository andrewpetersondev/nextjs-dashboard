import "server-only";
import { eq } from "drizzle-orm";
import type { UserDto } from "@/features/users/lib/dto";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { UserUpdatePatch } from "@/server/users/domain/types";
import {
  userDbRowToEntity,
  userEntityToDto,
} from "@/server/users/infrastructure/mappers/user.mapper";
import type { UserId } from "@/shared/branding/brands";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";
import { logger } from "@/shared/infrastructure/logging/infrastructure/logging.client";

/**
 * Updates a user in the database with the provided patch.
 * Always maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @param patch - An object containing the fields to update.
 * @returns The updated user as UserDto, or null if no changes or update failed.
 */
export async function updateUserDal(
  db: AppDatabase,
  id: UserId,
  patch: UserUpdatePatch,
): Promise<UserDto | null> {
  // Defensive: No update if patch is empty
  if (Object.keys(patch).length === 0) {
    return null;
  }
  try {
    // Always fetch raw DB row, then map to UserEntity for type safety
    const [userRow] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning();

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity (brands id/role)
    const userEntity = userDbRowToEntity(userRow);

    // Map to DTO for safe return to client
    return userEntityToDto(userEntity);
  } catch (error) {
    logger.error("Failed to update user.", {
      context: "updateUserDal",
      error,
      id,
      patch,
    });
    throw new AppError("database", {
      message: "Failed to update user.",
    });
  }
}
