import "server-only";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { UserId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { normalizeUnknownError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Retrieves a user from the database by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @returns The user as UserDto, or null if not found.
 */
export async function readUserDal(
  db: AppDatabase,
  id: UserId, // Use branded UserId for strict typing
): Promise<Result<UserEntity | null, AppError>> {
  try {
    // Fetch raw DB row, not UserEntity
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userRow) {
      return Ok(null);
    }

    // Map raw DB row to UserEntity for type safety (brands id/role)
    return Ok(toUserEntity(userRow));
  } catch (error) {
    logger.error("Failed to read user by ID.", {
      context: "readUserDal",
      error,
      id,
    });
    return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
  }
}
