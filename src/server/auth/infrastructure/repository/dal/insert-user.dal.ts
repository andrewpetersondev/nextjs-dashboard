// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { INFRASTRUCTURE_CONTEXTS } from "@/server/auth/infrastructure/infrastructure-error.logging";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { DalContext } from "@/server/auth/infrastructure/repository/types/dal-context";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { BaseError } from "@/shared/core/errors/base-error";
import { ERROR_CODES } from "@/shared/core/errors/error-codes";
import { logger } from "@/shared/logging/logger.shared";

const { context, success } = INFRASTRUCTURE_CONTEXTS.dal.insertUser;

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Never returns null; always throws on error or invariant violation.
 *
 * @param db - Database connection
 * @param input - AuthSignupDalInput containing validated, normalized user input
 * @returns Promise<NewUserRow> - The freshly inserted user row
 * @throws ConflictError (if unique constraint violated)
 * @throws DatabaseError (if underlying database fails)
 * @throws Error (if invariant/row-missing)
 */
export async function insertUserDal(
  db: AppDatabase,
  input: AuthSignupPayload,
): Promise<NewUserRow> {
  const { email, username, password, role } = input;

  const dalContext: DalContext = {
    context,
    identifiers: { email, username },
    operation: "insertUser",
  } as const;

  return await executeDalOrThrow(async () => {
    const [userRow] = await db
      .insert(users)
      .values({ email, password, role, username } satisfies NewUserRow)
      .returning();

    if (!userRow) {
      throw BaseError.wrap(
        ERROR_CODES.integrity.name,
        new Error("Insert did not return a row"),
        {
          context: dalContext.context,
          operation: dalContext.operation,
          ...dalContext.identifiers,
          kind: "invariant",
        },
      );
    }

    logger.info("User created", {
      ...success(email),
      context,
      role,
      userId: userRow.id,
    });

    return userRow;
  }, dalContext);
}
