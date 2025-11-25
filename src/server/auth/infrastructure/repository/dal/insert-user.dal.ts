// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { makeIntegrityError } from "@/shared/errors/core/base-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Never returns null; always throws on error or invariant violation.
 *
 * @param db - Database connection
 * @param input - AuthSignupDalInput containing validated, normalized user input
 * @param parentLogger - Repository / request-level logger to preserve context
 * @param requestId - Optional request ID for tracing
 * @returns Promise<NewUserRow> - The freshly inserted user row
 * @throws BaseError (if underlying database fails)
 * @throws Error (if invariant/row-missing)
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthSignupPayload,
  parentLogger: LoggingClientContract,
  requestId?: string,
): Promise<NewUserRow> {
  const { email, username, password, role } = input;
  const identifiers = { email, username } as Record<string, string>;

  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .insert(users)
        .values({ email, password, role, username } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        throw makeIntegrityError({
          context: { kind: "invariant" },
          message: "Insert did not return a row",
        });
      }

      logAuth(
        "info",
        "User row inserted",
        AuthLog.dal.insertUser.success({ email, userId: userRow.id }),
        { additionalData: { role }, requestId },
      );

      return userRow;
    },
    { identifiers, operation: "insertUser" },
    parentLogger,
  );
}
