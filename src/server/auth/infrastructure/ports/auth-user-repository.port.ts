// Tidy, explicit auth repository port for service -> repository -> DAL boundary.

// Shared plain user record used at repository/DAL boundaries (not for UI transport).
interface PlainUserRecord {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly role: string;
  readonly password: string; // hashed at rest when persisted
}

/**
 * Edge-only plain variant when adapting external sources (before hashing/role parsing).
 */
interface AuthSignupPayloadPlain {
  readonly email: string;
  readonly password: string;
  readonly role: string;
  readonly username: string;
}

interface AuthLoginRepoInputPlain {
  readonly email: string;
}

// Generic is the underlying repository binding (e.g., a tx-bound repo/knex/drizzle handle).
export interface AuthUserRepository<TRepo = unknown> {
  // Execute a function inside a transaction with a repo bound to that transaction.
  withTransaction<TResult>(
    fn: (txRepo: AuthUserRepository<TRepo>) => Promise<TResult>,
  ): Promise<TResult>;

  // Create a user; must return the persisted record (including id and hashed password).
  signup(input: AuthSignupPayloadPlain): Promise<PlainUserRecord>;

  // Lookup user for login by credential(s); returns record or rejects if not found per impl policy.
  login(input: AuthLoginRepoInputPlain): Promise<PlainUserRecord>;
}
