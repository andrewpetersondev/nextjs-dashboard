import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { type UserRow, users } from "@/server/db/schema/users";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Finds a user by email for login.
 * Verifies password, returns DB row or null.
 * @param db - Database connection
 * @param email - User email
 * @param password - Raw password to verify
 * @returns UserRow if found and password matches, otherwise null
 * @throws DatabaseError (infra errors only)
 */
export async function findUserForLogin(
  db: Database,
  email: string,
  password: string,
): Promise<UserRow | null> {
  if (!email || !password) {
    return null;
  }

  try {
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!userRow) {
      return null;
    }

    const validPassword = await import("@/server/auth/hashing").then((mod) =>
      mod.comparePassword(password, userRow.password),
    );
    if (!validPassword) {
      return null;
    }

    return userRow;
  } catch (error: unknown) {
    // Narrow error type using guards
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : "Unknown error";
    serverLogger.error({
      context: "findUserForLogin",
      email,
      error,
      message: "Failed to find user for login.",
    });
    throw new DatabaseError(
      "Failed to read user by email.",
      {},
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
