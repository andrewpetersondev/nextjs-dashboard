import "server-only";

import { eq } from "drizzle-orm";
import { executeDalResult } from "@/server/db/dal/execute-dal-result";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import type { AppError } from "@/shared/errors/core/app-error";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import type { Result } from "@/shared/result/result.types";

/**
 * Finds a user by email for login.
 * No password verification here; Service layer compares raw vs stored hash.
 *
 * @param db - Database connection
 * @param email - User email to search
 * @param logger - Logging client
 * @returns Result of found user row or null if not found
 */
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
  logger: LoggingClientContract,
): Promise<Result<UserRow | null, AppError>> {
  return await executeDalResult<UserRow | null>(
    async (): Promise<UserRow | null> => {
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
    { operationContext: "auth:dal" },
  );
}
