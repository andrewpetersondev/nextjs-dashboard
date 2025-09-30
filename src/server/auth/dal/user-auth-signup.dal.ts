import "server-only";

import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import type { UserEntity } from "@/server/users/entity";
import { userDbRowToEntity } from "@/server/users/mapper";
import type { AuthSignupDalInput } from "@/server/users/types";
import { ConflictError, ValidationError } from "@/shared/core/errors/domain";

// Prefer checking well-known Postgres unique violation code 23505.
// Keep a fallback regex to remain engine-agnostic in case of driver changes.
const UNIQUE_VIOLATION_CODE = "23505";
const uniqueConstraintRegex = /unique/i;

/**
 * Inserts a new user for the auth/signup flow.
 * - Expects password to already be a hash (service responsibility).
 * - Enforces uniqueness via DB constraint handling.
 * - Returns a normalized UserEntity.
 */
export async function createUserForSignup(
  db: Database,
  input: AuthSignupDalInput,
): Promise<UserEntity> {
  // Validate minimal required fields to avoid noisy DB roundtrips.
  if (!input?.email || !input?.password) {
    throw new ValidationError("Email and password are required.");
  }

  try {
    // Insert and return only the columns we need to map to entity.
    // If your `users` table returns extra sensitive columns by default,
    // the mapper should ignore them, but being explicit here avoids leaks.
    const [userRow] = await db.insert(users).values(input).returning();

    if (!userRow) {
      throw new DatabaseError("Failed to create user (no row returned).");
    }

    return userDbRowToEntity(userRow);
  } catch (err: any) {
    // Normalize unique-constraint conflicts into domain ConflictError
    const message = String(err?.message ?? "");
    const code = String(err?.code ?? "");
    const name = String(err?.name ?? "");

    const isUniqueViolation =
      code === UNIQUE_VIOLATION_CODE ||
      name === "UniqueConstraintError" ||
      uniqueConstraintRegex.test(message);

    if (isUniqueViolation) {
      throw new ConflictError(
        "A user with that email or username already exists.",
        { cause: err },
      );
    }

    if (err instanceof ConflictError || err instanceof ValidationError) {
      throw err;
    }

    // Log unexpected infra errors with limited PII
    serverLogger.error({
      context: "createUserForSignup",
      error: err,
      message: "Database error during auth signup.",
    });

    if (err instanceof DatabaseError) {
      throw err;
    }
    throw new DatabaseError("Database error during auth signup.", {}, err);
  }
}
