// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  type AuthLayerContext,
  createAuthOperationContext,
  toErrorContext,
} from "@/server/auth/logging/auth-layer-context";
import { AuthDalLogFactory } from "@/server/auth/logging/auth-logging.contexts";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { BaseError } from "@/shared/errors/base-error";
import { ERROR_CODES } from "@/shared/errors/error-codes";
import type { Logger } from "@/shared/logging/logger.shared";

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

  const dalContext: AuthLayerContext<"infrastructure.dal"> =
    createAuthOperationContext({
      identifiers: { email, username },
      layer: "infrastructure.dal",
      operation: "insertUser",
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
          toErrorContext(dalContext, {
            kind: "invariant",
          }),
        );
      }

      dalLogger.operation("info", "User row inserted", {
        ...AuthDalLogFactory.success("insertUser", {
          email,
          userId: userRow.id,
        }),
        context: dalContext.context,
        role,
      });

      return userRow;
    },
    dalContext,
    parentLogger,
  );
}
