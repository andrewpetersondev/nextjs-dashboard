import "server-only";

import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import type { AuthLoginRepoInput } from "@/modules/auth/server/contracts/auth-login-repo.dto";
import type { AuthSignupPayload } from "@/modules/auth/server/contracts/auth-signup.dto";
import type { AuthUserEntity } from "@/modules/auth/server/contracts/auth-user.entity";
import type { AuthUserRepository } from "@/modules/auth/server/infrastructure/db/repositories/auth-user.repository";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { AppError } from "@/shared/errors/core/app-error";
import type { Result } from "@/shared/result/result.types";

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

  login(
    input: Readonly<AuthLoginRepoInput>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    return this.repo.login(input);
  }

  signup(
    input: Readonly<AuthSignupPayload>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    return this.repo.signup(input);
  }
}
