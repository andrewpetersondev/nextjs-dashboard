import "server-only";

import { randomUUID } from "node:crypto";
import { TransactionLogger } from "@/modules/auth/server/application/observability/transaction-logger";
import { demoUserCounterDal } from "@/modules/auth/server/infrastructure/db/dal/demo-user-counter.dal";
import { getUserByEmailDal } from "@/modules/auth/server/infrastructure/db/dal/get-user-by-email.dal";
import { insertUserDal } from "@/modules/auth/server/infrastructure/db/dal/insert-user.dal";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/server/types/auth.types";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import {
  newUserDbRowToEntity,
  userDbRowToEntity,
} from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

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

  private readonly requestId: string;

  /**
   * @param db - Database connection used for all DAL operations.
   * @param logger - Logger (required).
   * @param requestId - Request id used to correlate logs across layers (required).
   */
  constructor(
    db: AppDatabase,
    logger: LoggingClientContract,
    requestId: string,
  ) {
    this.db = db;
    this.requestId = requestId;
    this.logger = logger.withContext("auth:repo").withRequest(requestId);
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
   * Fetches a login candidate user by email.
   *
   * @remarks
   * - Returns `Ok(null)` when the user does not exist.
   * - Returns `Ok(candidate)` even if password is missing (service owns semantics).
   * - Returns `Err(AppError)` for DAL/infra failures.
   *
   * @param input - Lookup input (email).
   */
  async login(
    input: Readonly<AuthLoginRepoInput>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    const rowResult = await getUserByEmailDal(
      this.db,
      input.email,
      this.logger,
    );

    if (!rowResult.ok) {
      this.logger.operation("error", "Login lookup failed (DAL)", {
        error: rowResult.error,
        operationIdentifiers: { email: input.email },
        operationName: "login.lookup.error",
      });

      return Err(rowResult.error);
    }

    const row = rowResult.value;

    if (!row) {
      this.logger.operation("info", "Login lookup: user not found", {
        operationIdentifiers: { email: input.email },
        operationName: "login.lookup.notFound",
      });

      return Ok<AuthUserEntity | null>(null);
    }

    this.logger.operation("info", "Login lookup: user retrieved", {
      operationIdentifiers: { email: input.email, userId: row.id },
      operationName: "login.lookup.success",
    });

    return Ok<AuthUserEntity>(userDbRowToEntity(row));
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
        const txRepo = new AuthUserRepository(tx, txLogger, this.requestId);
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
