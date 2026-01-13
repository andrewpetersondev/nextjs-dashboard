import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import type { AuthUserCreateDto } from "@/modules/auth/application/dtos/auth-user-create.dto";
import type { AuthUserLookupQueryDto } from "@/modules/auth/application/dtos/auth-user-lookup-query.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import type { AuthUserRepository } from "@/modules/auth/infrastructure/repositories/auth-user-repository";
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
  private readonly authUsers: AuthUserRepository;

  /**
   * @param authUsers - Concrete repository implementation to delegate to.
   */
  constructor(authUsers: AuthUserRepository) {
    this.authUsers = authUsers;
  }

  /**
   * @inheritdoc
   */
  incrementDemoUserCounter(role: UserRole): Promise<number> {
    return this.authUsers.incrementDemoUserCounter(role);
  }

  findByEmail(
    query: Readonly<AuthUserLookupQueryDto>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    return this.authUsers.findByEmail(query);
  }

  signup(
    input: Readonly<AuthUserCreateDto>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    return this.authUsers.signup(input);
  }
}
