import "server-only";
import { randomUUID } from "node:crypto";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/domain/auth.types";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import { TransactionLogger } from "@/modules/auth/domain/logging/transaction-logger";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import { demoUserCounterDal } from "@/modules/auth/server/infrastructure/repository/dal/demo-user-counter.dal";
import { getUserByEmailDal } from "@/modules/auth/server/infrastructure/repository/dal/get-user-by-email.dal";
import { insertUserDal } from "@/modules/auth/server/infrastructure/repository/dal/insert-user.dal";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Repository for user authentication flows (signup/login).
 * Encapsulates DAL usage and provides a single point for cross-cutting policies.
 */
export class AuthUserRepositoryImpl {
  protected readonly db: AppDatabase;
  private readonly logger: LoggingClientContract;
  private readonly requestId?: string;
  private readonly transactionLogger: TransactionLogger;

  constructor(
    db: AppDatabase,
    logger?: LoggingClientContract,
    requestId?: string,
  ) {
    this.db = db;
    this.logger = logger ?? defaultLogger;
    this.requestId = requestId;
    this.transactionLogger = new TransactionLogger(requestId);
  }

  /**
   * Increments the demo user counter.
   */
  async incrementDemoUserCounter(role: UserRole): Promise<number> {
    return await demoUserCounterDal(this.db, role, this.logger, this.requestId);
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
    const row = await getUserByEmailDal(
      this.db,
      input.email,
      this.logger,
      this.requestId,
    );

    if (!row?.password) {
      logAuth(
        "warn",
        "Login lookup resulted in no user with password",
        AuthLog.repository.login.notFound({ email: input.email }),
        { requestId: this.requestId },
      );
      return null;
    }

    logAuth(
      "info",
      "User retrieved successfully for login",
      AuthLog.repository.login.success({ email: input.email, userId: row.id }),
      { requestId: this.requestId },
    );

    return userDbRowToEntity(row);
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
    const row = await insertUserDal(
      this.db,
      input,
      this.logger,
      this.requestId,
    );

    logAuth(
      "info",
      "User created successfully",
      AuthLog.repository.signup.success({ email: input.email }),
      { requestId: this.requestId },
    );

    return newUserDbRowToEntity(row);
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

    if (typeof dbWithTx.transaction !== "function") {
      throw new Error("Database does not support transactions");
    }

    const transactionId = randomUUID();

    this.transactionLogger.start(transactionId);

    try {
      const result = await dbWithTx.transaction(async (tx: AppDatabase) => {
        const txRepo = new AuthUserRepositoryImpl(
          tx,
          this.logger,
          this.requestId,
        );
        return await fn(txRepo);
      });

      this.transactionLogger.commit(transactionId);
      return result;
    } catch (err) {
      this.transactionLogger.rollback(transactionId, err);
      throw err;
    }
  }
}
