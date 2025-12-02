import "server-only";
import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/server/domain/auth.types";
import type { AuthUserRepositoryImpl } from "@/modules/auth/server/infrastructure/repository/auth-user.repository";

/**
 * Thin adapter that translates the port interface to the repository implementation.
 *
 * No logging here - that's the repository's responsibility.
 */
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

  login(input: AuthLoginRepoInput): Promise<AuthUserEntity | null> {
    return this.repo.login(input);
  }
}
