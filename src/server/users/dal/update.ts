import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import type { UserDto } from "@/server/users/dto";
import { userDbRowToEntity, userEntityToDto } from "@/server/users/mapper";
import type { UserUpdatePatch } from "@/server/users/types";
import type { UserId } from "@/shared/brands/domain-brands";

/**
 * Updates a user in the database with the provided patch.
 * Always maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @param patch - An object containing the fields to update.
 * @returns The updated user as UserDto, or null if no changes or update failed.
 */
export async function updateUserDal(
  db: Database,
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
    serverLogger.error({
      context: "updateUserDal",
      error,
      id,
      message: "Failed to update user.",
      patch,
    });
    throw new DatabaseError(
      "Failed to update user.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
