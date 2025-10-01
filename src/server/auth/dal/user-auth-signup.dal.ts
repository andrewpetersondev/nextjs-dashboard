import "server-only";
import type { AuthSignupDalInput } from "@/server/auth/types/types";

import type { Database } from "@/server/db/connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { ConflictError } from "@/shared/core/errors/domain";

const UNIQUE_VIOLATION_CODE = "23505";
const uniqueConstraintRegex = /unique/i;

function hasKey<T extends string>(
  value: unknown,
  key: T,
): value is Record<T, unknown> {
  return typeof value === "object" && value !== null && key in value;
}

function readStringProp(
  err: unknown,
  key: "message" | "code" | "name",
): string {
  return hasKey(err, key) ? String(err[key] ?? "") : "";
}

function isUniqueViolation(err: unknown): boolean {
  const code = readStringProp(err, "code");
  const name = readStringProp(err, "name");
  const message = readStringProp(err, "message");
  return (
    code === UNIQUE_VIOLATION_CODE ||
    name === "UniqueConstraintError" ||
    uniqueConstraintRegex.test(message)
  );
}

/**
 * Inserts a new user for signup.
 * Expects pre-hashed password.
 * @param db - Database connection
 * @param input - AuthSignupDalInput
 * @returns NewUserRow if created, otherwise null
 * @throws ConflictError (unique violation), DatabaseError (infra errors)
 */
export async function createUserForSignup(
  db: Database,
  input: AuthSignupDalInput,
): Promise<NewUserRow | null> {
  if (!input?.email || !input?.password) {
    return null;
  }

  try {
    const [userRow] = await db.insert(users).values(input).returning();
    return userRow ?? null;
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "A user with that email or username already exists.",
        { cause: error },
      );
    }
    const errorMessage = readStringProp(error, "message") || "Unknown error";
    serverLogger.error({
      context: "createUserForSignup",
      error,
      message: "Database error during auth signup.",
    });
    throw new DatabaseError(
      "Database error during auth signup.",
      {},
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
