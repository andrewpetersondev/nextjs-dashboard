import "server-only";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/adapters/mappers/user.mapper";
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
    return Err(normalizeUnknownToAppError(error, APP_ERROR_KEYS.database));
  }
}
