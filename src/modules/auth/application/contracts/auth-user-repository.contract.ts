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
   * @returns The updated counter value after incrementing (or AppError on failure).
   */
  incrementDemoUserCounter(role: UserRole): Promise<Result<number, AppError>>;

  /**
   * Fetches a user candidate by their unique email.
   *
   * @param query - The lookup criteria including the email address.
   * @returns A promise resolving to a {@link Result} containing the found {@link AuthUserEntity},
   * null if no user matches the email, or an {@link AppError} for infrastructure failures.
   */
  findByEmail(
    query: Readonly<AuthUserLookupQueryDto>,
  ): Promise<Result<AuthUserEntity | null, AppError>>;

  /**
   * Creates a new user account in the persistent store.
   *
   * @param input - Signup payload required to create a user.
   * @returns A promise resolving to a {@link Result} containing the newly created {@link AuthUserEntity},
   * or an {@link AppError} (e.g., if the email already exists or a validation fails).
   */
  signup(
    input: Readonly<AuthUserCreateDto>,
  ): Promise<Result<AuthUserEntity, AppError>>;
}
