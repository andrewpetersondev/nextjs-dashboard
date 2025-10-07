import "server-only";
import { findUserForLogin } from "@/server/auth/dal/user-auth-login.dal";
import { createUserForSignup } from "@/server/auth/dal/user-auth-signup.dal";
import type { AuthLoginDalInput } from "@/server/auth/types/login.dtos";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { AppDatabase } from "@/server/db/db.connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/server/users/mapping/user.mappers";
import type { UserEntity } from "@/server/users/types/entity";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-error";

// --- Utility: Normalize input for signup, to enforce invariants early ---
function toNormalizedSignupInput(
  input: AuthSignupDalInput,
): AuthSignupDalInput {
  return {
    ...input,
    email: String(input.email).trim().toLowerCase(),
    username: String(input.username).trim(),
  };
}

// --- Utility: Validate mandatory signup fields ---
function assertSignupFields(input: AuthSignupDalInput): void {
  if (!input.email || !input.passwordHash || !input.username || !input.role) {
    throw new ValidationError("Missing required fields for signup.");
  }
}

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepo {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /**
   * Runs a sequence of operations within a database transaction.
   *
   * @param fn - The operations to perform within the transaction.
   * @returns The result of the operations.
   * @throws DatabaseError - If the transaction fails.
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepo) => Promise<T>,
  ): Promise<T> {
    try {
      const dbWithTx = this.db as {
        transaction: <R>(scope: (tx: unknown) => Promise<R>) => Promise<R>;
      };
      return await dbWithTx.transaction(async (tx) => {
        const txRepo = new AuthUserRepo(tx as unknown as AppDatabase);
        return await fn(txRepo);
      });
    } catch (err: unknown) {
      serverLogger.error(
        {
          context: "repo.AuthUserRepo.withTransaction",
          err,
          kind: "unexpected",
        },
        "Transaction failed in AuthUserRepo",
      );
      throw new DatabaseError("Transaction failed");
    }
  }

  /**
   * Creates a new user for the signup flow.
   *
   * @param input - Signup input, validated and normalized.
   * @returns The created user entity.
   * @throws ConflictError | ValidationError | DatabaseError
   */
  async signup(input: AuthSignupDalInput): Promise<UserEntity> {
    try {
      assertSignupFields(input);
      const normalized = toNormalizedSignupInput(input);

      const row = await createUserForSignup(this.db, normalized);

      // Defensive: DAL throws if row is not created, this check is redundant but type-safe.
      if (!row) {
        throw new DatabaseError("User row creation returned null/undefined.");
      }
      return newUserDbRowToEntity(row);
    } catch (err: unknown) {
      if (
        err instanceof ConflictError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      serverLogger.error(
        {
          context: "repo.AuthUserRepo.signup",
          err,
          kind: "unexpected",
        },
        "Unexpected error during signup repository operation",
      );
      throw new DatabaseError("Database operation failed during signup.");
    }
  }

  /**
   * Fetches a user by email for login.
   *
   * @param input - Login input (email only).
   * @returns The user entity if found and password fields exist.
   * @throws UnauthorizedError | ValidationError | DatabaseError
   */
  async login(input: AuthLoginDalInput): Promise<UserEntity> {
    try {
      const row = await findUserForLogin(this.db, input.email);

      if (!row) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      if (!row.password || typeof row.password !== "string") {
        serverLogger.error(
          {
            context: "repo.AuthUserRepo.login",
            kind: "auth-invariant",
            userId: row.id,
          },
          "User row missing hashed password; cannot authenticate",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }

      return userDbRowToEntity(row);
    } catch (err: unknown) {
      if (
        err instanceof UnauthorizedError ||
        err instanceof ValidationError ||
        err instanceof DatabaseError
      ) {
        throw err;
      }
      serverLogger.error(
        {
          context: "repo.AuthUserRepo.login",
          err,
          kind: "unexpected",
        },
        "Unexpected error during login repository operation",
      );
      throw new DatabaseError("Database operation failed during login.");
    }
  }
}
