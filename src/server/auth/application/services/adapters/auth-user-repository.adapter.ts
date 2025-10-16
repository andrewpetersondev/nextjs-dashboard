import "server-only";
import type { AuthLoginRepoInput } from "@/server/auth/domain/types/auth-login.input";
import type { AuthSignupRepoInput } from "@/server/auth/domain/types/auth-signup.input";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/repositories/auth-user.repository";

export class AuthUserRepositoryAdapter
  implements AuthUserRepository<AuthUserRepositoryImpl>
{
  private readonly repo: AuthUserRepositoryImpl;

  constructor(repo: AuthUserRepositoryImpl) {
    this.repo = repo;
  }

  withTransaction<T>(
    fn: (txRepo: AuthUserRepository<AuthUserRepositoryImpl>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new AuthUserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }

  signup(
    input: AuthSignupRepoInput,
  ): ReturnType<AuthUserRepositoryImpl["signup"]> {
    return this.repo.signup({
      email: input.email,
      password: input.password,
      role: input.role,
      username: input.username,
    });
  }

  login(
    input: AuthLoginRepoInput,
  ): ReturnType<AuthUserRepositoryImpl["login"]> {
    return this.repo.login({ email: input.email });
  }
}
