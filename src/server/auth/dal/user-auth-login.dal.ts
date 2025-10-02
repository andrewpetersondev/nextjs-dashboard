import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { type UserRow, users } from "@/server/db/schema/users";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function findUserForLogin(
  db: Database,
  email: string,
): Promise<UserRow | null> {
  if (!email) {
    return null;
  }

  try {
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Ensure the hashed password is present; without it Service cannot compare.
    if (!userRow) {
      return null;
    }
    if (!userRow.password || typeof userRow.password !== "string") {
      serverLogger.error(
        { context: "findUserForLogin", email },
        "User row missing hashed password; cannot authenticate",
      );
      return null;
    }

    return userRow ?? null;
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
      message: "Failed to read user by email.",
    });
    throw new DatabaseError(
      "Failed to read user by email.",
      {},
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
