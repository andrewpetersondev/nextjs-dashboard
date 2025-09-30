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
 * On success returns a normalized UserEntity.
 * Uses a generic UnauthorizedError for both user-not-found and bad-password.
 */
export async function findUserForLogin(
  db: Database,
  email: string,
  password: string,
): Promise<UserEntity> {
  if (!email || !password) {
    throw new ValidationError("Email and password are required.");
  }

  try {
    // Select only the fields required for password verification and mapping.
    // If your mapper expects the full row, ensure it tolerates missing fields
    // or adjust the selected columns accordingly.
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Unify not-found and invalid password into UnauthorizedError
    if (!userRow) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const userEntity = userDbRowToEntity(userRow);

    // Ensure entity contains hashed password; avoid leaking exact mismatch reason.
    const validPassword = await comparePassword(password, userEntity.password);
    if (!validPassword) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    return userEntity;
  } catch (error) {
    if (
      error instanceof UnauthorizedError ||
      error instanceof ValidationError
    ) {
      throw error;
    }

    // Limit PII in logs. Do not log raw password or full user row.
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
