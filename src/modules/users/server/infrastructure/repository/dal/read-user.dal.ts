import "server-only";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/user.entity";
import { userDbRowToEntity } from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { users } from "@/server-core/db/schema/users";
import type { UserId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";
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
): Promise<UserEntity | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety (brands id/role)
    return userDbRowToEntity(userRow);
  } catch (error) {
    logger.error("Failed to read user by ID.", {
      context: "readUserDal",
      error,
      id,
    });
    throw new AppError("database", {
      message: "Failed to read user by ID.",
    });
  }
}
