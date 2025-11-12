// src/server/auth/infrastructure/repository/dal/insert-user.dal.ts
import "server-only";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { executeDalOrThrow } from "@/server/auth/infrastructure/repository/dal/execute-dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { logger } from "@/shared/logging/logger.shared";

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
export async function insertUserDal(db: AppDatabase, input: AuthSignupPayload) {
  const { email, username, password, role } = input;

  return await executeDalOrThrow(
    async () => {
      const [userRow] = await db
        .insert(users)
        .values({
          email,
          password,
          role,
          username,
        } satisfies NewUserRow)
        .returning();

      if (!userRow) {
        // Log with error severity and diagnostic context
        logger.operation(
          "error",
          "Invariant failed: insertUser did not return a row",
          {
            context: "dal.users.insert",
            email,
            kind: "invariant",
            operation: "insertUser",
            role,
            username,
          },
        );

        throw BaseError.wrap(
          "integrity",
          new Error("Invariant: insert did not return a row"),
          {
            context: "dal.users.insert",
            email,
            kind: "invariant",
            operation: "insertUser",
            role,
            username,
          },
        );
      }

      logger.operation("info", "User inserted into DB", {
        context: "dal.users.insert",
        email,
        operation: "insertUser",
        role,
        userId: userRow.id,
        username,
      });

      return userRow;
    },
    {
      context: "dal.users.insert",
      identifiers: { email, username },
      operation: "insertUser",
    },
  );
}
