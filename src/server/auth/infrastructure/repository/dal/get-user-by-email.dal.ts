import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import { serverLogger } from "@/server/logging/logger.server";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
): Promise<UserRow | null> {
  return await executeDalOrThrow(
    async () => {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const userRow = rows?.[0];

      if (!userRow) {
        serverLogger.debug(
          { context: "dal.users.getByEmail", email },
          "No user found for email",
        );
        return null;
      }

      if (!userRow.password) {
        serverLogger.error(
          { context: "dal.users.getByEmail", email },
          "User row missing hashed password; cannot authenticate",
        );
        return null;
      }

      return userRow;
    },
    {
      context: "dal.users.getByEmail",
      identifiers: { email },
      operation: "getUserByEmail",
    },
  );
}
