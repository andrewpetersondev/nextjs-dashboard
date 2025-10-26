import "server-only";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import type { AuthUserEntity } from "@/server/auth/domain/types/auth-user-entity.types";
import { getUserByEmailDal } from "@/server/auth/infrastructure/repository/dal/get-user-by-email.dal";
import { insertUserDal } from "@/server/auth/infrastructure/repository/dal/insert-user.dal";
import type { AppDatabase } from "@/server/db/db.connection";
import { throwRepoDatabaseErr } from "@/server/errors/factories/layer-error-throw";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/logger.server";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/server/users/mapping/user.mappers";
import { isBaseError } from "@/shared/core/errors/base/base-error";
import { getErrorCodeMeta } from "@/shared/core/errors/base/error-codes";
import {
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepositoryImpl {
  protected readonly db: AppDatabase;
  private static readonly CTX = "repo.AuthUserRepo" as const;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /**
   * Runs a sequence of operations within a database transaction.
   * Keep thin; retries belong to a separate policy layer if needed.
   *
   * @param fn - Callback that receives a transactional repository instance
   * @returns The result of the callback function
   * @throws Re-throws any errors from the transaction
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepositoryImpl) => Promise<T>,
  ): Promise<T> {
    const dbWithTx = this.db as AppDatabase & {
      transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
    };

    try {
      return await dbWithTx.transaction(async (tx: AppDatabase) => {
        const txRepo = new AuthUserRepositoryImpl(tx);
        return await fn(txRepo);
      });
    } catch (err) {
      serverLogger.error(
        {
          context: `${AuthUserRepositoryImpl.CTX}.withTransaction`,
          kind: "db",
        },
        "Transaction failed",
      );
      throw err;
    }
  }

  /**
   * Creates a new user for the signup flow.
   *
   * @param input - Signup payload with user credentials
   * @returns The created user entity
   * @throws {ValidationError} When required fields are missing
   * @throws {ConflictError} When user already exists (via DAL)
   * @throws {DatabaseError} For infrastructure/timeout errors
   */
  async signup(input: Readonly<AuthSignupPayload>): Promise<AuthUserEntity> {
    const context = `${AuthUserRepositoryImpl.CTX}.signup`;

    try {
      this.assertSignupFields(input);
      const row = await insertUserDal(this.db, input);

      if (!row) {
        return throwRepoDatabaseErr("User creation did not return a row.");
      }

      return newUserDbRowToEntity(row);
    } catch (err: unknown) {
      if (this.isRepoKnownError(err)) {
        throw err;
      }

      serverLogger.error(
        { context, kind: "unexpected" },
        "Unexpected error during signup repository operation",
      );

      return throwRepoDatabaseErr(
        "Database operation failed during signup.",
        err,
      );
    }
  }

  /**
   * Fetches a user by email for login authentication.
   *
   * @param input - Login input containing email
   * @returns The user entity with password hash
   * @throws {UnauthorizedError} When user not found or password missing
   * @throws {DatabaseError} For infrastructure errors
   */
  async login(input: Readonly<AuthLoginRepoInput>): Promise<AuthUserEntity> {
    const context = `${AuthUserRepositoryImpl.CTX}.login`;

    try {
      const row = await getUserByEmailDal(this.db, input.email);

      if (!row?.password) {
        serverLogger.warn(
          {
            context,
            kind: "not_found_or_missing_password",
          },
          "User not found or missing password",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }

      return userDbRowToEntity(row);
    } catch (err: unknown) {
      if (this.isKnownLoginError(err)) {
        throw err;
      }

      serverLogger.error(
        { context, kind: "unexpected" },
        "Unexpected error during login repository operation",
      );

      return throwRepoDatabaseErr(
        "Database operation failed during login.",
        err,
      );
    }
  }

  /**
   * Validates that all required signup fields are present and non-empty.
   * @throws {ValidationError} When any required field is missing or empty.
   * @private
   */
  private assertSignupFields(input: Readonly<AuthSignupPayload>): void {
    const missingFields: string[] = [];

    if (!input.email) {
      missingFields.push("email");
    }
    if (!input.password) {
      missingFields.push("password");
    }
    if (!input.username) {
      missingFields.push("username");
    }
    if (!input.role) {
      missingFields.push("role");
    }

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields for signup: ${missingFields.join(", ")}`,
      );
    }
  }

  /**
   * Determines if an error is a known repository error that should be re-thrown as-is.
   * Known errors include DatabaseError and any BaseError with a defined error code.
   * @private
   */
  private isRepoKnownError(err: unknown): boolean {
    if (err instanceof DatabaseError) {
      return true;
    }

    if (isBaseError(err)) {
      return Boolean(getErrorCodeMeta(err.code));
    }

    return false;
  }

  /**
   * Type guard for known login errors that should be re-thrown.
   * @private
   */
  private isKnownLoginError(err: unknown): boolean {
    return (
      err instanceof UnauthorizedError ||
      err instanceof ValidationError ||
      err instanceof DatabaseError
    );
  }
}
