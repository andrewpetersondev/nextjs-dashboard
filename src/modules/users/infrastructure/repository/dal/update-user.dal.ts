import "server-only";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/adapters/mappers/user.mapper";
import type { UserPersistencePatch } from "@/modules/users/infrastructure/repository/user.repository.types";
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
  patch: UserPersistencePatch,
): Promise<Result<UserEntity | null, AppError>> {
  // Defensive: No update if patch is empty
  if (Object.keys(patch).length === 0) {
    return Ok(null);
  }
  try {
    // Always fetch raw DB row, then map to UserEntity for type safety
    const [userRow] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning();

    if (!userRow) {
      return Ok(null);
    }

    // Map raw DB row to UserEntity (brands id/role)
    return Ok(toUserEntity(userRow));
  } catch (error) {
    logger.error("Failed to update user.", {
      context: "updateUserDal",
      error,
      id,
      patch,
    });
    return Err(normalizeUnknownToAppError(error, APP_ERROR_KEYS.database));
  }
}
