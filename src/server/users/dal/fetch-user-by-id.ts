import "server-only";

import { eq } from "drizzle-orm";
import type { UserDto } from "@/features/users/lib/dto";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema/users";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { userDbRowToEntity, userEntityToDto } from "@/server/users/mapper";
import type { UserId } from "@/shared/domain/domain-brands";

/**
 * Fetches a user by their branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param id - UserId (branded)
 * @returns UserDto if found, otherwise null
 */
export async function fetchUserById(
  db: Database,
  id: UserId, // Use branded UserId for strict typing
): Promise<UserDto | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [userRow] = await db.select().from(users).where(eq(users.id, id));

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety
    const userEntity = userDbRowToEntity(userRow);

    // Map to DTO for safe return to client
    return userEntityToDto(userEntity);
  } catch (error) {
    serverLogger.error({
      context: "fetchUserById",
      error,
      id,
      message: "Failed to fetch user by id.",
    });
    throw new DatabaseError(
      "Failed to fetch user by id.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
