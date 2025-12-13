import "server-only";

import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/domain/auth.types";
import type { UserRole } from "@/modules/auth/domain/schema/auth.roles";
import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
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

  incrementDemoUserCounter(role: UserRole): Promise<number> {
    return this.repo.incrementDemoUserCounter(role);
  }

  login(input: Readonly<AuthLoginRepoInput>): Promise<AuthUserEntity | null> {
    return this.repo.login(input);
  }

  signup(input: Readonly<AuthSignupPayload>): Promise<AuthUserEntity> {
    return this.repo.signup(input);
  }

  withTransaction<T>(
    fn: (txRepo: AuthUserRepositoryPort<AuthUserRepositoryImpl>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new AuthUserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }
}
