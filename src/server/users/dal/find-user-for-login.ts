import "server-only";

import { eq } from "drizzle-orm";
import type { UserDto } from "@/features/users/dto/types";
import { comparePassword } from "@/server/auth/hashing";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { userDbRowToEntity, userEntityToDto } from "@/server/users/mapper";
import { users } from "../../../../node-only/schema/users";

/**
 * Finds a user by email and verifies the password.
 * Maps raw DB row to UserEntity, then to UserDto.
 * @param db - Database instance (Drizzle)
 * @param email - User's email address
 * @param password - Plaintext password to verify
 * @returns UserDto if credentials are valid, otherwise null
 */
export async function findUserForLogin(
  db: Database,
  email: string,
  password: string,
): Promise<UserDto | null> {
  if (!(email && password)) {
    return null;
  }

  try {
    // Always fetch raw row, then map to UserEntity for type safety
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity (brands id/role)
    const userEntity = userDbRowToEntity(userRow);

    // Securely compare password
    const validPassword = await comparePassword(password, userEntity.password);
    if (!validPassword) {
      return null;
    }

    // Map to DTO for safe return
    return userEntityToDto(userEntity);
  } catch (error) {
    serverLogger.error({
      context: "findUserForLogin",
      email,
      error,
      message: "Failed to find user for login.",
    });
    throw new DatabaseError(
      "Failed to read user by email.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
