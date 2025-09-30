import "server-only";

import { eq } from "drizzle-orm";
import { comparePassword } from "@/server/auth/hashing";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema/users";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import type { UserEntity } from "@/server/users/entity";
import { userDbRowToEntity } from "@/server/users/mapper";
import {
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";

/**
 * Finds a user by email and verifies the password.
 * Maps raw DB row to UserEntity, then to UserDto.
 * @param db - Database instance (Drizzle)
 * @param email - User's email address
 * @param password - Plaintext password to verify
 * @returns UserEntity if credentials are valid, otherwise throws UnauthorizedError
 */
export async function findUserForLogin(
  db: Database,
  email: string,
  password: string,
): Promise<UserEntity> {
  if (!(email && password)) {
    // Do not proceed with DB call on invalid input
    throw new ValidationError("Email and password are required.");
  }
  try {
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    // Unify user-not-found and bad-password into UnauthorizedError
    if (!userRow) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const userEntity = userDbRowToEntity(userRow);

    const validPassword = await comparePassword(password, userEntity.password);
    if (!validPassword) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    return userEntity;
  } catch (error) {
    // Pass through domain errors unchanged
    if (
      error instanceof UnauthorizedError ||
      error instanceof ValidationError
    ) {
      throw error;
    }

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
