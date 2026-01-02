import "server-only";

import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { type UserRow, users } from "@/server/db/schema/users";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { executeDalResult } from "@/shared/errors/server/adapters/dal/execute-dal-result";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import type { Result } from "@/shared/results/result.types";

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
  logger: LoggingClientPort,
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
          operationContext: "auth:dal",
          operationIdentifiers: { email },
          operationName: "getUserByEmail.notFound",
        });
        return null;
      }

      logger.operation("info", "User row fetched", {
        operationContext: "auth:dal",
        operationIdentifiers: { email, userId: userRow.id },
        operationName: "getUserByEmail.success",
      });

      return userRow;
    },
    { entity: "user", identifiers: { email }, operation: "getUserByEmail" },
    logger,
    { operationContext: "auth:dal" },
  );
}
