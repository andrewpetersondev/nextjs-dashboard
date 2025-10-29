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
  return await executeDalOrThrow(
    async () => {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const userRow = rows?.[0];

      if (!userRow) {
        logger.debug("No user found for email", {
          context: "dal.users.getByEmail",
          email,
        });
        return null;
      }

      if (!userRow.password) {
        logger.error("User row missing hashed password; cannot authenticate", {
          context: "dal.users.getByEmail",
          email,
        });
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
