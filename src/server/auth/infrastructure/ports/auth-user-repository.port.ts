// Contracts (ports) for UserAuthService dependencies.
// Keep these tiny and stable for easy testing/mocking.
// Keep unbranded for broad implementability?
// Use plain types.

import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupRepoInputPlain } from "@/server/auth/domain/types/auth-signup.input";

export interface AuthUserRepository<TRepo = unknown> {
  // Execute a function inside a transaction. The function receives a repository bound to the transaction.
  withTransaction<T>(
    fn: (txRepo: AuthUserRepository<TRepo>) => Promise<T>,
  ): Promise<T>;

  // Domain operations the service needs.
  signup(input: AuthSignupRepoInputPlain): Promise<{
    id: string;
    email: string;
    username: string;
    role: string;
    password?: string | null;
  }>;

  login(input: AuthLoginRepoInput): Promise<{
    id: string;
    email: string;
    username: string;
    role: string;
    password?: string | null;
  }>;
}
