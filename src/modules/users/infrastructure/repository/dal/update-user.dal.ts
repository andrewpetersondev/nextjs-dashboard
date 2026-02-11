import "server-only";
import { eq } from "drizzle-orm";
import type {
  UpdateUserProps,
  UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { UserId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { normalizeUnknownError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

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
  patch: UpdateUserProps,
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
    return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
  }
}
