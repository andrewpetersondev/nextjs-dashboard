// Tidy, explicit auth repository port for service -> repository -> DAL boundary.

import "server-only";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import type { AuthUserEntity } from "@/server/auth/domain/types/auth-user-entity.types";

// Generic is the underlying repository binding (e.g., a tx-bound repo/knex/drizzle handle).
export interface AuthUserRepository<TRepo = unknown> {
  // Execute a function inside a transaction with a repo bound to that transaction.
  withTransaction<TResult>(
    fn: (txRepo: AuthUserRepository<TRepo>) => Promise<TResult>,
  ): Promise<TResult>;

  // Create a user; must return the persisted record (including id and hashed password).
  signup(input: AuthSignupPayload): Promise<AuthUserEntity>;

  // Lookup user for login by credential(s); returns record or rejects if not found per impl policy.
  login(input: AuthLoginRepoInput): Promise<AuthUserEntity>;
}
