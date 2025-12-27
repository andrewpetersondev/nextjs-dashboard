import "server-only";

import type { AuthLoginRepoInput } from "@/modules/auth/server/contracts/auth-login-repo.dto";
import type { AuthSignupPayload } from "@/modules/auth/server/contracts/auth-signup.dto";
import type { AuthUserEntity } from "@/modules/auth/server/contracts/auth-user.entity";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Application-layer repository port for user authentication persistence.
 *
 * ## Purpose
 * This interface defines the persistence capabilities required by the auth
 * application core (services/use-cases). It is intentionally technology-agnostic:
 * callers depend on this contract, while infrastructure provides concrete
 * implementations (often via an adapter).
 *
 * ## Usage
 * - Consumed by application services/use-cases
 * - Implemented by an adapter that delegates to an infrastructure repository
 *
 * ## Transactions
 * Transactions are owned by the application layer via {@link UnitOfWorkPort}.
 * Repository ports should remain transaction-agnostic.
 */
export interface AuthUserRepositoryPort {
  /**
   * Increments the demo user counter for a specific role.
   *
   * @param role - The role whose demo counter should be incremented.
   * @returns The updated counter value after incrementing.
   */
  incrementDemoUserCounter(role: UserRole): Promise<number>;

  /**
   * Fetches a user suitable for password-based login.
   *
   * @remarks
   * - Returns `Ok(null)` when user does not exist.
   * - Returns `Ok(AuthUserEntity)` when user exists (password hash is required by schema).
   * - Returns `Err(AppError)` for DAL/infra failures.
   */
  login(
    input: Readonly<AuthLoginRepoInput>,
  ): Promise<Result<AuthUserEntity | null, AppError>>;

  /**
   * Creates a new user account.
   *
   * @param input - Signup payload required to create a user.
   * @returns Result with the created user entity, or AppError for expected failures.
   */
  signup(
    input: Readonly<AuthSignupPayload>,
  ): Promise<Result<AuthUserEntity, AppError>>;
}
