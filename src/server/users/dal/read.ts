import "server-only";

import { eq } from "drizzle-orm";
import type { UserDto } from "@/features/users/lib/dto";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  userDbRowToEntity,
  userEntityToDto,
} from "@/server/users/mapping/user.mappers";
import type { UserId } from "@/shared/domain/domain-brands";

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
    serverLogger.error({
      context: "readUserDal",
      error,
      id,
      message: "Failed to read user by ID.",
    });
    throw new DatabaseError(
      "Failed to read user by ID.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
