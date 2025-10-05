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
} from "@/shared/core/errors/domain-error";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepo {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  //  /**
  //   * Run a sequence of repository operations inside a transaction.
  //   * Orchestration remains in Service; txRepo mirrors this repository API but is bound to the tx connection.
  //   */
  //  async withTransaction<T>(
  //    fn: (txRepo: AuthUserRepo) => Promise<T>,
  //  ): Promise<T> {
  //    try {
  //      // Use the underlying db's transaction type without forcing it to Database.
  //      // The callback receives a tx that is API-compatible with Database for our repository needs.
  //      // We construct a repo bound to that tx and keep fn's typing over the repo surface.
  //      return await (
  //        this.db as {
  //          transaction: <R>(scope: (tx: unknown) => Promise<R>) => Promise<R>;
  //        }
  //      ).transaction(async (tx) => {
  //        // todo: what the hell is this?
  //        const txRepo = new AuthUserRepo(tx as unknown as Database);
  //        return await fn(txRepo);
  //      });
  //    } catch (err: unknown) {
  //      serverLogger.error(
  //        {
  //          context: "repo.AuthUserRepo.withTransaction",
  //          err,
  //          kind: "unexpected",
  //        },
  //        "Transaction failed in AuthUserRepo",
  //      );
  //      throw new DatabaseError("Transaction failed");
  //    }
  //  }

  /**
   * Run a sequence of repository operations inside a transaction.
   * Orchestration remains in Service; txRepo mirrors this repository API but is bound to the tx connection.
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepo) => Promise<T>,
  ): Promise<T> {
    try {
      // Preserve Drizzle's transaction type while keeping our repo API surface.
      const dbWithTx = this.db as {
        transaction: <R>(scope: (tx: unknown) => Promise<R>) => Promise<R>;
      };

      return await dbWithTx.transaction(async (tx) => {
        // Bind a repo to the transactional connection; keep Database-compat at call sites.
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

      // REFACTOR: move input validation and normalization to the action layer and service layer.
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
