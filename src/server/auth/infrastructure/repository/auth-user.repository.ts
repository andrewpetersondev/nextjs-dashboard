// src/server/auth/infrastructure/repository/auth-user.repository.ts
import "server-only";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import type { AuthUserEntity } from "@/server/auth/domain/types/auth-user-entity.types";
import { getUserByEmailDal } from "@/server/auth/infrastructure/repository/dal/get-user-by-email.dal";
import { insertUserDal } from "@/server/auth/infrastructure/repository/dal/insert-user.dal";
import type { AppDatabase } from "@/server/db/db.connection";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/server/users/mapping/user.mappers";
import { UnauthorizedError } from "@/shared/core/errors/domain/domain-errors";
import type { Logger } from "@/shared/logging/logger.shared";
import { logger as defaultLogger } from "@/shared/logging/logger.shared";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepositoryImpl {
  protected readonly db: AppDatabase;
  private readonly logger: Logger;
  private static readonly CTX = "repo.AuthUserRepo" as const;

  constructor(db: AppDatabase, logger: Logger = defaultLogger) {
    this.db = db;
    this.logger = logger.withContext(AuthUserRepositoryImpl.CTX);
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

    const txLogger = this.logger.withContext("withTransaction");
    txLogger.debug("Starting transaction");

    try {
      const result = await dbWithTx.transaction(async (tx: AppDatabase) => {
        const txRepo = new AuthUserRepositoryImpl(tx, this.logger);
        return await fn(txRepo);
      });

      txLogger.debug("Transaction completed successfully");
      return result;
    } catch (err) {
      txLogger.error("Transaction failed", {
        error: err instanceof Error ? { message: err.message } : String(err),
        kind: "db",
      } as const);
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
    const signupLogger = this.logger.withContext("signup");

    // executeDalOrThrow already normalizes all errors; no need to catch/re-wrap
    const row = await insertUserDal(this.db, input);

    signupLogger.info("User created successfully", {
      email: input.email,
      kind: "success",
      userId: row.id,
    } as const);
    return newUserDbRowToEntity(row);
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
    const loginLogger = this.logger.withContext("login");

    const row = await getUserByEmailDal(this.db, input.email);

    if (!row?.password) {
      loginLogger.info("Login attempt with invalid credentials", {
        email: input.email,
        kind: "invalid_credentials",
      } as const);
      throw new UnauthorizedError("Invalid email or password.");
    }

    loginLogger.info("User retrieved successfully for login", {
      email: input.email,
      kind: "success",
      userId: row.id,
    } as const);
    return userDbRowToEntity(row);
  }
}
