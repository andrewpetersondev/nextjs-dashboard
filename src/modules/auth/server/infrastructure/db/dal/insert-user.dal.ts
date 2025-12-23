import "server-only";

import type { AuthSignupPayload } from "@/modules/auth/server/contracts/auth-signup.dto";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { executeDalResult } from "@/shared/errors/server/adapters/dal/execute-dal-result";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import type { Result } from "@/shared/result/result.types";

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Throws on invariant violations; never returns null.
 *
 * @param db - Database connection
 * @param input - Signup payload
 * @param logger - Logging client
 * @returns Inserted user row
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthSignupPayload,
  logger: LoggingClientPort,
): Promise<Result<NewUserRow, AppError>> {
  const { email, password, role, username } = input;

  return await executeDalResult<NewUserRow>(
    async (): Promise<NewUserRow> => {
      const [userRow] = await db
        .insert(users)
        .values({ email, password, role, username } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        throw makeAppError(APP_ERROR_KEYS.integrity, {
          cause: "Database returned empty result set for insert",
          message: "Insert did not return a row",
          metadata: { pgCode: PG_CODES.UNEXPECTED_INTERNAL_ERROR },
        });
      }

      logger.operation("info", "User row inserted", {
        operationContext: "auth:dal",
        operationIdentifiers: { email, role, userId: userRow.id, username },
        operationName: "insertUser.success",
      });

      return userRow;
    },
    {
      entity: "user",
      identifiers: { email, username },
      operation: "insertUser",
    },
    logger,
    { operationContext: "auth:dal" },
  );
}
