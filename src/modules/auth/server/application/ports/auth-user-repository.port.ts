import "server-only";

import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/server/types/auth.types";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";

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
 * - Consumed by application services (e.g., `AuthUserService`)
 * - Implemented by an adapter that delegates to an infrastructure repository
 *
 * ## Transactions
 * Use {@link withTransaction} to run a sequence of repository operations atomically.
 * The callback receives a transaction-scoped repository port instance that must be
 * used for all operations within the transaction.
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
   * Fetches a user suitable for login.
   *
   * ## Semantics
   * - Returns an {@link AuthUserEntity} when a matching user exists **and** a password is present.
   * - Returns `null` when the user does not exist or exists but has no password set.
   *
   * ## Errors
   * Infrastructure/DAL failures are propagated and mapped by repository/domain error mappers.
   *
   * @param input - Credentials/identifier required to locate the login candidate user.
   * @returns The user entity if login is possible; otherwise `null`.
   */
  login(input: Readonly<AuthLoginRepoInput>): Promise<AuthUserEntity | null>;

  /**
   * Creates a new user account.
   *
   * @param input - Signup payload required to create a user.
   * @returns The created user entity.
   */
  signup(input: Readonly<AuthSignupPayload>): Promise<AuthUserEntity>;

  /**
   * Executes the provided function within a database transaction.
   *
   * ## Contract
   * - The callback receives a transaction-scoped repository port instance (`txRepo`).
   * - All persistence operations that must be atomic should be performed via `txRepo`.
   * - The transaction is committed if the callback resolves; rolled back if it rejects.
   *
   * @typeParam T - The result type produced by the callback.
   * @param fn - Callback that performs transactional work using `txRepo`.
   * @returns The callback result.
   */
  withTransaction<T>(
    fn: (txRepo: AuthUserRepositoryPort) => Promise<T>,
  ): Promise<T>;
}
