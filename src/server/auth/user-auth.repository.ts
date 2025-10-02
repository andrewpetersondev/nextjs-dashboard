import "server-only";
import { findUserForLogin } from "@/server/auth/dal/user-auth-login.dal";
import { createUserForSignup } from "@/server/auth/dal/user-auth-signup.dal";
import type { AuthLoginDalInput } from "@/server/auth/types/login.dtos";
import type { AuthSignupDalInput } from "@/server/auth/types/signup.dtos";
import type { Database } from "@/server/db/connection";
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
} from "@/shared/core/errors/domain";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepo {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Run a sequence of repository operations inside a transaction.
   * Orchestration remains in Service; txRepo mirrors this repository API but is bound to the tx connection.
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepo) => Promise<T>,
  ): Promise<T> {
    // Assume Database has a transaction API: db.transaction(async (tx) => { ... })
    // If your Database typing differs, adapt the call shape here.
    try {
      // @ts-expect-error: adapt to your Database transaction signature if needed
      return await this.db.transaction(async (tx: Database) => {
        const txRepo = new AuthUserRepo(tx);
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
   * Creates a new user for the auth/signup flow.
   * @throws ConflictError | ValidationError | DatabaseError
   */
  async signup(input: AuthSignupDalInput): Promise<UserEntity> {
    try {
      if (
        !input.email ||
        !input.passwordHash ||
        !input.username ||
        !input.role
      ) {
        throw new ValidationError("Missing required fields for signup.");
      }

      const row = await createUserForSignup(this.db, {
        email: String(input.email).trim().toLowerCase(),
        passwordHash: input.passwordHash,
        role: input.role,
        username: String(input.username).trim(),
      });

      if (!row) {
        throw new ValidationError("Email, username and password are required.");
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
          kind: "unexpected",
        },
        "Unexpected error during signup repository operation",
      );
      throw new DatabaseError("Database operation failed during signup.");
    }
  }

  /**
   * Fetches a user by email for login; Service will verify password against stored hash.
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
          { context: "repo.AuthUserRepo.login" },
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
        { context: "repo.AuthUserRepo.login", kind: "unexpected" },
        "Unexpected error during login repository operation",
      );
      throw new DatabaseError("Database operation failed during login.");
    }
  }
}
