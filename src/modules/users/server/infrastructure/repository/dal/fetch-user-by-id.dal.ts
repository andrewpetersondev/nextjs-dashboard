import "server-only";

import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/user.entity";
import { toUserEntity } from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { UserId } from "@/shared/branding/brands";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Fetches a user by their branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param id - UserId (branded)
 * @returns UserDto if found, otherwise null
 */
export async function fetchUserByIdDal(
  db: AppDatabase,
  id: UserId, // Use branded UserId for strict typing
): Promise<UserEntity | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [userRow] = await db.select().from(users).where(eq(users.id, id));

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety
    return toUserEntity(userRow);
  } catch (error) {
    logger.error("Failed to fetch user by id.", {
      context: "fetchUserById",
      error,
      id,
    });
    throw makeAppError(APP_ERROR_KEYS.database, {
      cause: "",
      message: "Failed to fetch user by id.",
      metadata: {},
    });
  }
}
