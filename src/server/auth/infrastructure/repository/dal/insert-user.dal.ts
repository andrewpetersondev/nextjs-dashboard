// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthDalLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
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
 * @returns Promise<NewUserRow> - The freshly inserted user row
 * @throws BaseError (if underlying database fails)
 * @throws Error (if invariant/row-missing)
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthSignupPayload,
  parentLogger: LoggingClientContract,
): Promise<NewUserRow> {
  const { email, username, password, role } = input;

  const dalContext: AuthLogLayerContext<"infrastructure.dal"> =
    createAuthOperationContext({
      identifiers: { email, username },
      layer: "infrastructure.dal",
      operation: "insertUser",
    });

  // Use child logger with dal scope
  const dalLogger = parentLogger.child({ scope: "dal" });

  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .insert(users)
        .values({ email, password, role, username } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        throw makeIntegrityError({
          context: {
            kind: "invariant",
          },
          message: "Insert did not return a row",
        });
      }

      dalLogger.operation("info", "User row inserted", {
        ...AuthDalLogFactory.success("insertUser", {
          email,
          userId: userRow.id,
        }),
        details: { role },
      });

      return userRow;
    },
    dalContext,
    parentLogger,
  );
}
