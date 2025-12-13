import "server-only";

import { randomUUID } from "node:crypto";
import type { UserRole } from "@/modules/auth/domain/user/auth.roles";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/domain/user/auth.types";
import { TransactionLogger } from "@/modules/auth/server/application/observability/transaction-logger";
import { demoUserCounterDal } from "@/modules/auth/server/infrastructure/repository/dal/demo-user-counter.dal";
import { getUserByEmailDal } from "@/modules/auth/server/infrastructure/repository/dal/get-user-by-email.dal";
import { insertUserDal } from "@/modules/auth/server/infrastructure/repository/dal/insert-user.dal";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Concrete infrastructure repository for auth-related user persistence.
 *
 * ## Layering
 * This class sits in the **infrastructure** layer and encapsulates all direct
 * database/DAL interactions needed by authentication flows.
 *
 * Application code should typically depend on an application-facing port
 * (e.g., `AuthUserRepositoryPort`) and receive this repository via an adapter.
 *
 * ## Responsibilities
 * - Call DAL functions to read/write user data required for auth use-cases
 * - Convert raw database rows into domain entities via mappers
 * - Emit structured logs for repository-level events
 * - Provide transaction support via {@link withTransaction}
 *
 * ## Non-responsibilities
 * - Defining authentication semantics (e.g., “invalid credentials”) — belongs in services
 * - Mapping expected domain/app errors — higher layers handle that
 *
 * ## Server-only
 * Intended for server execution (database access + Node crypto UUID).
 */
export class AuthUserRepository {
  /** Database connection (or transaction-scoped connection) used by DAL calls. */
  protected readonly db: AppDatabase;

  /** Repository-scoped logger enriched with auth context and optional request id. */
  private readonly logger: LoggingClientContract;

  /**
   * @param db - Database connection used for all DAL operations.
   * @param logger - Optional logger; defaults to the shared logger.
   * @param requestId - Optional request id used to correlate logs across layers.
   */
  constructor(
    db: AppDatabase,
    logger?: LoggingClientContract,
    requestId?: string,
  ) {
    this.db = db;
    const base = (logger ?? defaultLogger).withContext("auth:repo");
    this.logger = requestId ? base.withRequest(requestId) : base;
  }

  /**
   * Increments the demo user counter for a given role.
   *
   * @param role - Role whose counter should be incremented.
   * @returns The updated counter value.
   *
   * @remarks
   * This method delegates to the DAL and returns its numeric result. Any DAL errors
   * are allowed to propagate to be handled/mapped by higher layers.
   */
  async incrementDemoUserCounter(role: UserRole): Promise<number> {
    return await demoUserCounterDal(this.db, role, this.logger);
  }

  /**
   * Fetches a user by email for login purposes.
   *
   * ## Semantics
   * - Returns an {@link AuthUserEntity} when the user exists **and** a password hash is present.
   * - Returns `null` when the user does not exist or has no password set.
   *
   * ## Logging
   * Emits repository-level success/failure events for observability without enforcing
   * auth semantics (that belongs to the service layer).
   *
   * @param input - Lookup input (email).
   * @returns A user entity usable for authentication, or `null`.
   */
  async login(
    input: Readonly<AuthLoginRepoInput>,
  ): Promise<AuthUserEntity | null> {
    const row = await getUserByEmailDal(this.db, input.email, this.logger);

    if (!row?.password) {
      this.logger.operation(
        "warn",
        "Login lookup resulted in no user with password",
        {
          operationIdentifiers: { email: input.email },
          operationName: "login.notFound",
        },
      );
      return null;
    }

    this.logger.operation("info", "User retrieved successfully for login", {
      operationIdentifiers: { email: input.email, userId: row.id },
      operationName: "login.success",
    });

    return userDbRowToEntity(row);
  }

  /**
   * Creates a new user for the signup flow.
   *
   * @param input - Signup payload (already validated/normalized by higher layers as needed).
   * @returns The created user entity.
   *
   * @remarks
   * DAL-level errors are intentionally not translated here; they are propagated so
   * upper layers can map them consistently.
   */
  async signup(input: Readonly<AuthSignupPayload>): Promise<AuthUserEntity> {
    const row = await insertUserDal(this.db, input, this.logger);

    this.logger.operation("info", "User created successfully", {
      operationIdentifiers: { email: input.email, userId: row.id },
      operationName: "signup.success",
    });

    return newUserDbRowToEntity(row);
  }

  /**
   * Executes a callback inside a database transaction.
   *
   * ## Contract
   * - The callback receives a **transaction-scoped** {@link AuthUserRepository} instance.
   * - Use that instance for all reads/writes that must be atomic.
   * - Commits when the callback resolves; rolls back when it rejects/throws.
   *
   * ## Observability
   * - Generates a `transactionId` and logs transaction lifecycle events via {@link TransactionLogger}.
   *
   * @typeParam T - The result type returned by the transactional callback.
   * @param fn - Callback that performs transactional work.
   * @returns The callback result.
   * @throws Re-throws any error produced by the callback or transaction machinery.
   */
  async withTransaction<T>(
    fn: (txRepo: AuthUserRepository) => Promise<T>,
  ): Promise<T> {
    const dbWithTx = this.db as AppDatabase & {
      transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
    };

    if (typeof dbWithTx.transaction !== "function") {
      throw new Error("Database does not support transactions");
    }

    const transactionId = randomUUID();
    const txLogger = this.logger
      .child({ transactionId })
      .withContext("auth:tx");

    const txEvents = new TransactionLogger(txLogger);

    txEvents.start(transactionId);

    try {
      const result = await dbWithTx.transaction(async (tx: AppDatabase) => {
        const txRepo = new AuthUserRepository(tx, txLogger);
        return await fn(txRepo);
      });

      txEvents.commit(transactionId);
      return result;
    } catch (err) {
      txEvents.rollback(err, transactionId);
      throw err;
    }
  }
}
