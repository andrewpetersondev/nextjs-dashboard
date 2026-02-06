import "server-only";
import type { AuthUserCreateDto } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-create.dto";
import type { AuthUserLookupQuery } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-lookup.query";
import { validateAuthUserCreateDto } from "@/modules/auth/application/auth-user/validators/auth-user-create.validator";
import { validateAuthUserEntity } from "@/modules/auth/application/auth-user/validators/auth-user-entity.validator";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import { getUserByEmailDal } from "@/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal";
import { incrementDemoUserCounterDal } from "@/modules/auth/infrastructure/persistence/auth-user/dal/increment-demo-user-counter.dal";
import { insertUserDal } from "@/modules/auth/infrastructure/persistence/auth-user/dal/insert-user.dal";
import { pgUniqueViolationToSignupConflictError } from "@/modules/auth/infrastructure/persistence/auth-user/mappers/pg-unique-violation-to-signup-conflict-error.mapper";
import { toAuthUserEntity } from "@/modules/auth/infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import type { UserRole } from "@/shared/validation/user/user-role.schema";

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
   * @returns Result containing the updated counter value.
   *
   * @remarks
   * This method delegates to the DAL and returns its numeric result. Any DAL errors
   * are allowed to propagate to be handled/mapped by higher layers.
   */
  async incrementDemoUserCounter(
    role: UserRole,
  ): Promise<Result<number, AppError>> {
    return await incrementDemoUserCounterDal(this.db, role, this.logger);
  }

  /**
   * Finds a user by email.
   *
   * @param query - The lookup query containing the email.
   * @returns A promise resolving to a {@link Result} containing the user entity or null.
   */
  async findByEmail(
    query: Readonly<AuthUserLookupQuery>,
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

    if (!row) {
      return Ok(null);
    }

    const entity = toAuthUserEntity(row);
    const validationResult = validateAuthUserEntity(entity);

    if (!validationResult.ok) {
      this.logger.error("AuthUserEntity validation failed in findByEmail", {
        error: validationResult.error,
        userId: entity.id,
      });
      return validationResult;
    }

    return Ok(entity);
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
    const preDalValidation = validateAuthUserCreateDto(input);

    if (!preDalValidation.ok) {
      this.logger.error(
        "AuthUserCreateDto validation failed before insertUserDal",
        {
          email: input.email,
          error: preDalValidation.error,
          role: input.role,
          username: input.username,
        },
      );
      return preDalValidation;
    }

    const rowResult = await insertUserDal(this.db, input, this.logger);

    if (!rowResult.ok) {
      const mapped = pgUniqueViolationToSignupConflictError(rowResult.error);
      return Err(mapped ?? rowResult.error);
    }

    const entity = toAuthUserEntity(rowResult.value);
    const validationResult = validateAuthUserEntity(entity);

    if (!validationResult.ok) {
      this.logger.error("AuthUserEntity validation failed in signup", {
        error: validationResult.error,
        userId: entity.id,
      });
      return validationResult;
    }

    return Ok(entity);
  }
}
