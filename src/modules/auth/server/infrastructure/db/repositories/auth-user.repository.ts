import "server-only";

import type { AuthLoginRepoInput } from "@/modules/auth/server/contracts/auth-login-repo.dto";
import type { AuthSignupPayload } from "@/modules/auth/server/contracts/auth-signup.dto";
import type { AuthUserEntity } from "@/modules/auth/server/contracts/auth-user.entity";
import { demoUserCounterDal } from "@/modules/auth/server/infrastructure/db/dal/demo-user-counter.dal";
import { getUserByEmailDal } from "@/modules/auth/server/infrastructure/db/dal/get-user-by-email.dal";
import { insertUserDal } from "@/modules/auth/server/infrastructure/db/dal/insert-user.dal";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import {
  toNewUserEntity,
  toUserEntity,
} from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
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
  private readonly logger: LoggingClientPort;

  /**
   * @param db - Database connection used for all DAL operations.
   * @param logger - Logger (required).
   * @param requestId - Request id used to correlate logs across layers (required).
   */
  constructor(db: AppDatabase, logger: LoggingClientPort, requestId: string) {
    this.db = db;
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
      return Err(rowResult.error);
    }

    const row = rowResult.value;

    if (!row) {
      return Ok<AuthUserEntity | null>(null);
    }

    return Ok<AuthUserEntity>(toUserEntity(row));
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
  async signup(
    input: Readonly<AuthSignupPayload>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    const rowResult = await insertUserDal(this.db, input, this.logger);

    if (!rowResult.ok) {
      return Err(rowResult.error);
    }

    const entity = toNewUserEntity(rowResult.value);

    return Ok(entity);
  }
}
