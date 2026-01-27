import "server-only";
import type { AuthUserCreateDto } from "@/modules/auth/application/dtos/auth-user-create.dto";
import type { AuthUserLookupQueryDto } from "@/modules/auth/application/dtos/auth-user-lookup-query.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import { pgUniqueViolationToSignupConflictError } from "@/modules/auth/domain/mappers/pg-unique-violation-to-signup-conflict-error.mapper";
import { getUserByEmailDal } from "@/modules/auth/infrastructure/persistence/dal/get-user-by-email.dal";
import { incrementDemoUserCounterDal } from "@/modules/auth/infrastructure/persistence/dal/increment-demo-user-counter.dal";
import { insertUserDal } from "@/modules/auth/infrastructure/persistence/dal/insert-user.dal";
import { toAuthUserEntity } from "@/modules/auth/infrastructure/persistence/mappers/to-auth-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Concrete infrastructure repository for auth-related user persistence.
 * This class handles the actual DAL calls and data mapping.
 */
export class AuthUserRepository {
  /** Database connection (or transaction-scoped connection) used by DAL calls. */
  protected readonly db: AppDatabase;

  /** Repository-scoped logger enriched with auth context and optional request id. */
  private readonly logger: LoggingClientContract;

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
    return await incrementDemoUserCounterDal(this.db, role, this.logger);
  }

  async findByEmail(
    query: Readonly<AuthUserLookupQueryDto>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    const rowResult = await getUserByEmailDal(
      this.db,
      query.email,
      this.logger,
    );

    if (!rowResult.ok) {
      return rowResult;
    }

    const row = rowResult.value;

    return Ok(row ? toAuthUserEntity(row) : null);
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
    input: Readonly<AuthUserCreateDto>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    const rowResult = await insertUserDal(this.db, input, this.logger);

    if (!rowResult.ok) {
      const mapped = pgUniqueViolationToSignupConflictError(rowResult.error);
      return Err(mapped ?? rowResult.error);
    }

    const entity = toAuthUserEntity(rowResult.value);

    return Ok(entity);
  }
}
