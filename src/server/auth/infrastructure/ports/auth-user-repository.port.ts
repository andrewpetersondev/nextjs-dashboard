import "server-only";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import type { AuthUserEntity } from "@/server/auth/domain/types/auth-user-entity.types";

export interface AuthUserRepository<TRepo = unknown> {
  withTransaction<TResult>(
    fn: (txRepo: AuthUserRepository<TRepo>) => Promise<TResult>,
  ): Promise<TResult>;

  signup(input: AuthSignupPayload): Promise<AuthUserEntity>;

  login(input: AuthLoginRepoInput): Promise<AuthUserEntity>;
}
