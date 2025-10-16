// Contracts (ports) for UserAuthService dependencies.
// Keep these tiny and stable for easy testing/mocking.

import type { PasswordHash } from "@/server/auth/types/password.types";

export interface PasswordHasher {
  // Raw password is plain string for now.
  hash(raw: string): Promise<PasswordHash>;
  compare(raw: string, hash: PasswordHash): Promise<boolean>;
}

export interface AuthUserRepository<TRepo = unknown> {
  // Execute a function inside a transaction. The function receives a repository bound to the transaction.
  withTransaction<T>(
    fn: (txRepo: AuthUserRepository<TRepo>) => Promise<T>,
  ): Promise<T>;

  // Domain operations the service needs.
  signup(input: {
    email: string;
    username: string;
    passwordHash: string;
    role: string;
  }): Promise<{
    id: string;
    email: string;
    username: string;
    role: string;
    // password may or may not be present on returned entity depending on mapping layer
    password?: string | null;
  }>;

  login(input: { email: string }): Promise<{
    id: string;
    email: string;
    username: string;
    role: string;
    password?: string | null;
  }>;
}
