import "server-only";
import { eq } from "drizzle-orm";
import { executeDalOrThrowAuth } from "@/modules/auth/server/infrastructure/repository/dal/execute-dal-or-throw.auth";
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
  logger: LoggingClientContract,
): Promise<UserRow | null> {
  return await executeDalOrThrowAuth(
    async () => {
      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!userRow) {
        logger.operation("info", "User not found", {
          operationIdentifiers: { email },
          operationName: "getUserByEmail.notFound",
        });
        return null;
      }

      logger.operation("info", "User row fetched", {
        operationIdentifiers: { email, userId: userRow.id },
        operationName: "getUserByEmail.success",
      });

      return userRow;
    },
    { identifiers: { email }, operation: "getUserByEmail" },
    logger,
  );
}
