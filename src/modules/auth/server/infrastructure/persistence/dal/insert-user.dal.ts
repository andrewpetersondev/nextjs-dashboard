import "server-only";
import type { AuthSignupPayload } from "@/modules/auth/domain/user/auth.types";
import { executeDalOrThrow } from "@/server/db/dal/execute-dal-or-throw";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { makeIntegrityError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

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
): Promise<NewUserRow> {
  const { email, password, role, username } = input;
  const identifiers: Record<string, string> = { email, username };

  return await executeDalOrThrow<NewUserRow>(
    async (): Promise<NewUserRow> => {
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
    { operationContext: "auth:dal" },
  );
}
