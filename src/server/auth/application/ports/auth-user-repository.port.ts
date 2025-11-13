import "server-only";
import type { AuthUserEntity } from "@/server/auth/domain/entities/auth-user-entity.types";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";

export interface AuthUserRepositoryPort<Trepo = unknown> {
  withTransaction<Tresult>(
    fn: (txRepo: AuthUserRepositoryPort<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;

  signup(input: AuthSignupPayload): Promise<AuthUserEntity>;

  login(input: AuthLoginRepoInput): Promise<AuthUserEntity>;
}
