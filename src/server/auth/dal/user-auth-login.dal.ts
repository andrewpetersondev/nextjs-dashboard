import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import { executeDalOrThrow } from "@/server/errors/error-wrappers.throw";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function findUserForLogin(
  db: AppDatabase,
  email: string,
): Promise<UserRow | null> {
  if (!email) {
    return null;
  }

  return await executeDalOrThrow(async () => {
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
  });
}
