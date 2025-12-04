// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";

import type { AuthSignupPayload } from "@/modules/auth/domain/auth.types";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import { executeDalOrThrow } from "@/modules/auth/server/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { type NewUserRow, users } from "@/server-core/db/schema";
import { makeIntegrityError } from "@/shared/errors/factories/app-error.factory";
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
 * @throws AppError (if underlying database fails)
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
          message: "Insert did not return a row",
          metadata: { kind: "invariant" },
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
