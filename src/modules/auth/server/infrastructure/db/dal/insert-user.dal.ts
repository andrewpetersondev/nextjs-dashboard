import "server-only";
import type { AuthSignupPayload } from "@/modules/auth/server/contracts/auth-signup.dto";

import { executeDalResult } from "@/server/db/dal/execute-dal-result";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import type { AppError } from "@/shared/errors/core/app-error";
import { makeIntegrityError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
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
  logger: LoggingClientContract,
): Promise<Result<NewUserRow, AppError>> {
  const { email, password, role, username } = input;

  return await executeDalResult<NewUserRow>(
    async (): Promise<NewUserRow> => {
      const [userRow] = await db
        .insert(users)
        .values({ email, password, role, username } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        throw makeIntegrityError({
          cause: "Database returned empty result set for insert",
          message: "Insert did not return a row",
          metadata: { kind: "invariant" },
        });
      }

      logger.operation("info", "User row inserted", {
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
