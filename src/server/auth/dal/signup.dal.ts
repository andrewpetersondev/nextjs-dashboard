import "server-only";
import { executeDalOrThrow } from "@/server/auth/dal/auth-utils.dal";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Inserts a new user record for signup flow with a pre-hashed password.
 * Never returns null; always throws on error or invariant violation.
 *
 * @param db - Database connection
 * @param input - AuthSignupDalInput containing validated, normalized user input
 * @returns {Promise<NewUserRow>} - The freshly inserted user row
 * @throws ConflictError (if unique constraint violated)
 * @throws DatabaseError (if underlying database fails)
 * @throws Error (if invariant/row-missing)
 *
 * @remarks
 * executeDalOrThrow maps 23505 → ConflictError; other PG codes → DatabaseError with generic, recognizable messages and code in context.
 * Invariant “row must exist” is explicitly thrown with a clear Error after logging.
 * withDalTransaction is a reusable helper for atomic multi-step writes with the same normalization.
 * Identifiers in logs exclude secrets (no passwords/tokens).
 */
export async function signupDal(
  db: AppDatabase,
  input: AuthSignupDalInput,
): Promise<NewUserRow> {
  const { email, username, passwordHash, role } = input;

  return await executeDalOrThrow(
    async () => {
      const insertedRows = await db
        .insert(users)
        .values({
          email,
          password: passwordHash,
          role,
          username,
        } satisfies NewUserRow)
        .returning();

      const userRow = insertedRows?.[0];

      if (!userRow) {
        // Invariant: A successful DB insert must return the row; log and throw explicit error
        serverLogger.error(
          {
            context: "dal.signupDal",
            email, // identifier; not a secret
            kind: "invariant",
            role,
            username,
          },
          "INSERT returned no user row",
        );
        throw new Error(
          "Invariant violation: insert did not return a new user row. This should never happen.",
        );
      }

      return userRow;
    },
    // Minimal, non-sensitive logging context and identifiers
    { context: "dal.signupDal", identifiers: { email, username } },
  );
}
