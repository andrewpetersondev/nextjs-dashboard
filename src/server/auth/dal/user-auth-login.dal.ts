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
  return await executeDalOrThrow(async () => {
    const selectedRow = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const userRow = selectedRow?.[0];

    // Ensure the hashed password is present; without it Service cannot compare.
    if (!userRow) {
      serverLogger.error(
        {
          context: "dal.findUserForLogin",
          email,
          msg: "SELECT returned no user row; indicates DB or ORM invariant violation",
        },
        "User selection: invariant violation (no row returned)",
      );
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
