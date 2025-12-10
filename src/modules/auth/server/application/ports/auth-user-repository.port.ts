/** biome-ignore-all lint/style/useNamingConvention: <remove this biome rule> */

import "server-only";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/domain/auth.types";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";

export interface AuthUserRepositoryPort<TRepo = unknown> {
  withTransaction<TResult>(
    fn: (txRepo: AuthUserRepositoryPort<TRepo>) => Promise<TResult>,
  ): Promise<TResult>;

  signup(input: AuthSignupPayload): Promise<AuthUserEntity>;

  /**
   * Increments the demo user counter for a specific role.
   */
  incrementDemoUserCounter(role: UserRole): Promise<number>;

  /**
   * Fetches a user suitable for login.
   *
   * Returns:
   * - AuthUserEntity when a user with a password exists
   * - null when the user is not found or lacks a password
   *
   * DAL-level errors are propagated and mapped by the repo/domain error mappers.
   */
  login(input: AuthLoginRepoInput): Promise<AuthUserEntity | null>;
}
