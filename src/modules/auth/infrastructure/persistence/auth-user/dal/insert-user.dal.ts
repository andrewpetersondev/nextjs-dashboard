import "server-only";
import type { AuthUserCreateDto } from "@/modules/auth/application/auth-user/dtos/auth-user-create.dto";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, type UserRow, users } from "@/server/db/schema";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { executeDalResult } from "@/shared/errors/server/adapters/dal/execute-dal-result";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import type { Result } from "@/shared/results/result.types";

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 *
 * @remarks
 * The database generates the ID. Throws on invariant violations; never returns null.
 *
 * @param db - Database connection.
 * @param input - Signup payload containing user details and pre-hashed password.
 * @param logger - Logging client.
 * @returns A promise resolving to a {@link Result} containing the inserted user row (full record including DB-generated ID).
 * @throws {@link AppError} if the database returns an empty result set or on unexpected database errors.
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthUserCreateDto,
  logger: LoggingClientContract,
): Promise<Result<UserRow, AppError>> {
  const { email, password, role, username } = input;

  return await executeDalResult<UserRow>(
    async (): Promise<UserRow> => {
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
