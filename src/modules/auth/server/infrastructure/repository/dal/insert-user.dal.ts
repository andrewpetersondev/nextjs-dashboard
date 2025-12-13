import "server-only";
import type { AuthSignupPayload } from "@/modules/auth/domain/user/auth.types";
import { executeDalOrThrowAuth } from "@/modules/auth/server/infrastructure/repository/dal/execute-dal-or-throw.auth";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { makeIntegrityError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Never returns null; always throws on error or invariant violation.
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthSignupPayload,
  logger: LoggingClientContract,
): Promise<NewUserRow> {
  const { email, password, role, username } = input;
  const identifiers = { email, username } as Record<string, string>;

  return await executeDalOrThrowAuth(
    async () => {
      const [userRow] = await db
        .insert(users)
        .values({ email, password, role, username } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        throw makeIntegrityError({
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
    { identifiers, operation: "insertUser" },
    logger,
  );
}
