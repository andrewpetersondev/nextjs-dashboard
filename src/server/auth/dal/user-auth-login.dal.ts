import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { type UserRow, users } from "@/server/db/schema/users";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Finds a user by email for login and verifies the provided raw password
 * against the stored password hash.
 */
export async function findUserForLogin(
  db: Database,
  email: string,
  passwordRaw: string,
): Promise<UserRow | null> {
  if (!email || !passwordRaw) {
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
      mod.comparePassword(passwordRaw, userRow.password),
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
