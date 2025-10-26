import "server-only";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupPayload } from "@/server/auth/domain/types/auth-signup.input";
import type { AuthUserRepositoryPort } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/repositories/auth-user.repository";

export class AuthUserRepositoryAdapter
  implements AuthUserRepositoryPort<AuthUserRepositoryImpl>
{
  private readonly repo: AuthUserRepositoryImpl;

  constructor(repo: AuthUserRepositoryImpl) {
    this.repo = repo;
  }

  withTransaction<T>(
    fn: (txRepo: AuthUserRepositoryPort<AuthUserRepositoryImpl>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new AuthUserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }

  signup(
    input: AuthSignupPayload,
  ): ReturnType<AuthUserRepositoryImpl["signup"]> {
    return this.repo.signup(input);
  }

  login(
    input: AuthLoginRepoInput,
  ): ReturnType<AuthUserRepositoryImpl["login"]> {
    return this.repo.login(input);
  }
}
