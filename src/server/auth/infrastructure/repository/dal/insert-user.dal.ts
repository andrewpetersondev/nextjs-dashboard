// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import {
  createDalContext,
  type DalContext,
} from "@/server/auth/infrastructure/dal-context";
import { INFRASTRUCTURE_CONTEXTS } from "@/server/auth/infrastructure/infrastructure-error.logging";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { BaseError } from "@/shared/core/errors/base-error";
import { ERROR_CODES } from "@/shared/core/errors/error-codes";
import type { Logger } from "@/shared/logging/logger.shared";

const { context, success } = INFRASTRUCTURE_CONTEXTS.dal.insertUser;

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Never returns null; always throws on error or invariant violation.
 *
 * @param db - Database connection
 * @param input - AuthSignupDalInput containing validated, normalized user input
 * @param parentLogger - Repository / request-level logger to preserve context
 * @returns Promise<NewUserRow> - The freshly inserted user row
 * @throws ConflictError (if unique constraint violated)
 * @throws DatabaseError (if underlying database fails)
 * @throws Error (if invariant/row-missing)
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthSignupPayload,
  parentLogger: Logger,
): Promise<NewUserRow> {
  const { email, username, password, role } = input;

  const dalContext: DalContext = createDalContext("insertUser", context, {
    email,
    username,
  });

  const dalLogger = parentLogger.withContext(dalContext.context);

  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .insert(users)
        .values({ email, password, role, username } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        throw BaseError.wrap(
          ERROR_CODES.integrity.name,
          new Error("Insert did not return a row"),
          {
            ...dalContext,
            kind: "invariant",
          },
        );
      }

      const resultMeta = success(email);

      dalLogger.operation("info", "User row inserted", {
        context: dalContext.context,
        identifiers: {
          ...dalContext.identifiers,
          userId: userRow.id,
        },
        kind: resultMeta.kind,
        operation: dalContext.operation,
        ...(resultMeta.details && { details: resultMeta.details }),
        role,
      } as const);

      return userRow;
    },
    dalContext,
    parentLogger,
  );
}
