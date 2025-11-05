import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import { logger } from "@/shared/logging/logger.shared";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
): Promise<UserRow | null> {
  const logCtx = {
    context: "dal.users.getByEmail",
    identifiers: { email },
    operation: "getUserByEmail",
  } as const;

  return await executeDalOrThrow(async () => {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const userRow = rows?.[0];

    if (!userRow) {
      // Use new operation helper
      logger.operation("debug", "No user found for email", logCtx);
      return null;
    }

    if (!userRow.password) {
      // Use new operation helper
      logger.operation("error", "User row missing hashed password", logCtx);
      return null;
    }

    return userRow;
  }, logCtx);
}
