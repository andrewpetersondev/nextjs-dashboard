import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/server/application/types/contracts/auth-user.repository.contract";
import type { AuthLoginInputDto } from "@/modules/auth/server/application/types/dtos/auth-login.input.dto";
import type { AuthSignupInputDto } from "@/modules/auth/server/application/types/dtos/auth-signup.input.dto";
import type { AuthUserEntity } from "@/modules/auth/server/application/types/models/auth-user.entity";
import type { AuthUserRepository } from "@/modules/auth/server/infrastructure/db/repositories/auth-user.repository";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Adapter that exposes an infrastructure {@link AuthUserRepository} through the
 * application-facing {@link AuthUserRepositoryContract}.
 *
 * ## Why this exists
 * The application layer depends only on contracts. The infrastructure layer provides
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
export class AuthUserRepositoryAdapter implements AuthUserRepositoryContract {
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
    input: Readonly<AuthLoginInputDto>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    return this.repo.login(input);
  }

  signup(
    input: Readonly<AuthSignupInputDto>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    return this.repo.signup(input);
  }
}
