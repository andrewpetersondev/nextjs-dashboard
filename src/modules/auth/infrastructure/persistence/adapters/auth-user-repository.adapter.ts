import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import type { AuthUserCreateDto } from "@/modules/auth/application/dtos/auth-user-create.dto";
import type { AuthUserLookupQueryDto } from "@/modules/auth/application/dtos/auth-user-lookup-query.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import type { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/repositories/auth-user.repository";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Adapter that exposes an infrastructure {@link AuthUserRepository} through the
 * application-facing {@link AuthUserRepositoryContract}.
 *
 * @remarks The adapter is a wrapper for now, but in the future, code will be added.
 */
export class AuthUserRepositoryAdapter implements AuthUserRepositoryContract {
  private readonly authUsers: AuthUserRepository;

  /**
   * @param authUsers - Concrete repository implementation to delegate to.
   */
  constructor(authUsers: AuthUserRepository) {
    this.authUsers = authUsers;
  }

  findByEmail(
    query: Readonly<AuthUserLookupQueryDto>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    return this.authUsers.findByEmail(query);
  }

  /**
   * @inheritdoc
   */
  incrementDemoUserCounter(role: UserRole): Promise<number> {
    return this.authUsers.incrementDemoUserCounter(role);
  }

  signup(
    input: Readonly<AuthUserCreateDto>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    return this.authUsers.signup(input);
  }
}
