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
 * Retrieves a user from the database by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @returns The user as UserDto, or null if not found.
 */
export async function readUserDal(
  db: Database,
  id: UserId, // Use branded UserId for strict typing
): Promise<UserDto | null> {
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
    const userEntity = userDbRowToEntity(userRow);

    // Map to DTO for safe return to client
    return userEntityToDto(userEntity);
  } catch (error) {
    logger.error({
      context: "readUserDal",
      error,
      id,
      message: "Failed to read user by ID.",
    });
    throw new DatabaseError_New(
      "Failed to read user by ID.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
