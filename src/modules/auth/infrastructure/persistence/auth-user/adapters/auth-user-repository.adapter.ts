import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/auth-user/contracts/repositories/auth-user-repository.contract";
import type { AuthUserCreateDto } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-create.dto";
import type { AuthUserLookupQuery } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-lookup.query";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import type { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/auth-user/repositories/auth-user.repository";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";
import type { UserRole } from "@/shared/validation/user-role/user-role.constants";

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

  /**
   * Finds a user by email.
   *
   * @param query - The lookup query containing the email.
   * @returns A promise resolving to a {@link Result} containing the user entity or null.
   */
  findByEmail(
    query: Readonly<AuthUserLookupQuery>,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    return this.authUsers.findByEmail(query);
  }

  /**
   * @inheritdoc
   */
  incrementDemoUserCounter(role: UserRole): Promise<Result<number, AppError>> {
    return this.authUsers.incrementDemoUserCounter(role);
  }

  /**
   * Registers a new user.
   *
   * @param input - The signup data.
   * @returns A promise resolving to a {@link Result} containing the created user entity.
   */
  signup(
    input: Readonly<AuthUserCreateDto>,
  ): Promise<Result<AuthUserEntity, AppError>> {
    return this.authUsers.signup(input);
  }
}
