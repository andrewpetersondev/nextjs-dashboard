// src/server/auth/infrastructure/repository/auth-user.repository.ts
import "server-only";
import { randomUUID } from "node:crypto";
import type { AuthUserEntity } from "@/server/auth/domain/entities/auth-user-entity.types";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import { getUserByEmailDal } from "@/server/auth/infrastructure/repository/dal/get-user-by-email.dal";
import { insertUserDal } from "@/server/auth/infrastructure/repository/dal/insert-user.dal";
import { AuthRepoLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import { TransactionLogger } from "@/server/auth/logging-auth/transaction-logger";
import type { AppDatabase } from "@/server/db/db.connection";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/server/users/mapping/user.mappers";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infra/logging.client";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepositoryImpl {
  protected readonly db: AppDatabase;
  private readonly logger: LoggingClientContract;
  private readonly transactionLogger: TransactionLogger;

  constructor(db: AppDatabase, logger: LoggingClientContract = defaultLogger) {
    this.db = db;
    // Inherit context/request from parent, just add repository scope
    this.logger = logger.child({ scope: "repository" });
    this.transactionLogger = new TransactionLogger(this.logger);
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

    const transactionId = randomUUID();

    this.transactionLogger.start(transactionId);

    try {
      const result = await dbWithTx.transaction(async (tx: AppDatabase) => {
        // Pass the repository-scoped logger to the transaction instance
        const txRepo = new AuthUserRepositoryImpl(tx, this.logger);
        return await fn(txRepo);
      });

      this.transactionLogger.commit(transactionId);
      return result;
    } catch (err) {
      const data = AuthRepoLogFactory.exception("withTransaction", err, {
        transactionId,
      });
      this.logger.operation("error", "Repository transaction failed", data);

      // Don't enrich error with logging context - keep them separate
      this.transactionLogger.rollback(transactionId, err);
      throw err;
    }
  }

  /**
   * Creates a new user for the signup flow.
   *
   * @param input - Signup payload with user credentials
   * @returns The created user entity
   *
   * Errors:
   * - DAL-level errors are propagated as-is for higher layers to map.
   */
  async signup(input: Readonly<AuthSignupPayload>): Promise<AuthUserEntity> {
    const signupLogger = this.logger; // already scoped

    // executeDalOrThrow already normalizes all errors and logs them
    // Pass the repository logger down to DAL
    const row = await insertUserDal(this.db, input, this.logger);

    const data = AuthRepoLogFactory.success("signup", {
      email: input.email,
    });

    signupLogger.operation("info", "User created successfully", data);

    return newUserDbRowToEntity(row);
  }

  /**
   * Fetches a user by email for login authentication.
   *
   * Semantics:
   * - Returns AuthUserEntity when a user with a password exists
   * - Returns null when user does not exist or has no password
   *
   * No auth/domain errors are thrown here; those belong to higher layers.
   * DAL-level errors still propagate for centralized mapping.
   */
  async login(
    input: Readonly<AuthLoginRepoInput>,
  ): Promise<AuthUserEntity | null> {
    const loginLogger = this.logger; // already scoped

    // Align logical operation name with service and DAL
    const row = await getUserByEmailDal(
      this.db,
      input.email,
      this.logger,
      "login",
    );

    if (!row?.password) {
      loginLogger.operation(
        "warn",
        "Login lookup resulted in no user with password",
        {
          ...AuthRepoLogFactory.notFound("login", { email: input.email }),
        },
      );
      return null;
    }

    const data = AuthRepoLogFactory.success("login", {
      email: input.email,
      userId: row.id,
    });

    loginLogger.operation(
      "info",
      "User retrieved successfully for login",
      data,
    );

    return userDbRowToEntity(row);
  }
}
