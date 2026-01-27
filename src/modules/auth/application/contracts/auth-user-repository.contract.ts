import type { AuthUserCreateDto } from "@/modules/auth/application/dtos/auth-user-create.dto";
import type { AuthUserLookupQueryDto } from "@/modules/auth/application/dtos/auth-user-lookup-query.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Application-layer repository contract for user authentication persistence.
 *
 * ## Purpose
 * This interface defines the persistence capabilities required by the Use Cases.
 */
export interface AuthUserRepositoryContract {
  /**
   * Increments the demo user counter for a specific role.
   *
   * @param role - The role whose demo counter should be incremented.
   * @returns The updated counter value after incrementing.
   */
  incrementDemoUserCounter(role: UserRole): Promise<number>;

  /**
   * Fetches a user candidate by their unique email.
   *
   * @param query - The lookup criteria.
   */
  findByEmail(
    query: Readonly<AuthUserLookupQueryDto>,
  ): Promise<Result<AuthUserEntity | null, AppError>>;

  /**
   * Creates a new user account.
   *
   * @param input - Signup payload required to create a user.
   * @returns Result with the created user entity, or AppError for expected failures.
   */
  signup(
    input: Readonly<AuthUserCreateDto>,
  ): Promise<Result<AuthUserEntity, AppError>>;
}
