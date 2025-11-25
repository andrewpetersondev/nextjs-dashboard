// src/server/auth/infrastructure/repository/dal/get-user-by-email.dal.ts
import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
  parentLogger: LoggingClientContract,
  requestId?: string,
): Promise<UserRow | null> {
  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!userRow) {
        logAuth(
          "info",
          "User not found",
          AuthLog.dal.getUserByEmail.notFound({ email }),
          { requestId },
        );
        return null;
      }

      logAuth(
        "info",
        "User row fetched",
        AuthLog.dal.getUserByEmail.success({ email }),
        { requestId },
      );

      return userRow;
    },
    { identifiers: { email }, operation: "getUserByEmail" },
    parentLogger,
  );
}
