import "server-only";

import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import type { AuthUserRepository } from "@/modules/auth/server/infrastructure/db/repositories/auth-user.repository";
import type {
  AuthLoginRepoInput,
  AuthSignupPayload,
  AuthUserEntity,
} from "@/modules/auth/server/types/auth.types";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";

/**
 * Adapter that exposes an infrastructure {@link AuthUserRepository} through the
 * application-facing {@link AuthUserRepositoryPort}.
 *
 * ## Why this exists
 * The application layer depends only on ports. The infrastructure layer provides
 * concrete repositories. This adapter bridges the two without leaking
 * infrastructure types into the application core.
 *
 * ## Responsibilities
 * - Delegate calls to the underlying repository implementation
 * - Translate transactional repositories into transactional *ports* (see {@link withTransaction})
 *
 * ## Non-responsibilities
 * - No logging: logging is the repository implementation’s job
 * - No business rules: those belong in services/use-cases
 */
export class AuthUserRepositoryAdapter implements AuthUserRepositoryPort {
  private readonly repo: AuthUserRepository;

  /**
   * @param repo - Concrete repository implementation to delegate to.
   */
  constructor(repo: AuthUserRepository) {
    this.repo = repo;
  }

  /**
   * @inheritdoc
   */
  incrementDemoUserCounter(role: UserRole): Promise<number> {
    return this.repo.incrementDemoUserCounter(role);
  }

  /**
   * @inheritdoc
   */
  login(input: Readonly<AuthLoginRepoInput>): Promise<AuthUserEntity | null> {
    return this.repo.login(input);
  }

  /**
   * @inheritdoc
   */
  signup(input: Readonly<AuthSignupPayload>): Promise<AuthUserEntity> {
    return this.repo.signup(input);
  }

  /**
   * Runs the callback in a transaction, ensuring the callback receives an
   * {@link AuthUserRepositoryPort} even though the infrastructure transaction API
   * exposes an {@link AuthUserRepository}.
   *
   * @inheritdoc
   */
  withTransaction<T>(
    fn: (txRepo: AuthUserRepositoryPort) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo: AuthUserRepository) => {
      const txAdapter = new AuthUserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }
}
