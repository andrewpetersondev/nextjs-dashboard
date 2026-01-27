import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import { AuthErrorFactory } from "@/modules/auth/application/factories/auth-error.factory";
import { toAuthUserOutputDto } from "@/modules/auth/application/mappers/to-auth-user-output-dto.mapper";
import type { LoginRequestDto } from "@/modules/auth/application/schemas/login-request.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Authenticates a user by validating their credentials against stored records.
 *
 * This use case handles the core business logic for user authentication,
 * including user lookup, password verification, and mapping to a safe DTO.
 */
export class LoginUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly repo: AuthUserRepositoryContract;

  /**
   * @param repo - Repository for accessing user authentication data.
   * @param hasher - Service for hashing and comparing passwords.
   * @param logger - Logging client for audit and debugging.
   */
  constructor(
    repo: AuthUserRepositoryContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.withContext("auth:use-case:login-user");
  }

  /**
   * Executes the login business logic.
   *
   * @param input - The login credentials (email and password).
   * @returns A Result containing the authenticated user DTO or an AppError.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
  execute(
    input: Readonly<LoginRequestDto>,
  ): Promise<Result<AuthenticatedUserDto, AppError>> {
    return safeExecute(
      async () => {
        const userResult = await this.repo.findByEmail({ email: input.email });

        if (!userResult.ok) {
          return userResult;
        }

        const user = userResult.value;

        if (!user) {
          return Err(
            AuthErrorFactory.makeCredentialFailure("user_not_found", {
              email: input.email,
            }),
          );
        }

        const passwordOkResult = await this.hasher.compare(
          input.password,
          user.password,
        );

        if (!passwordOkResult.ok) {
          return Err(passwordOkResult.error);
        }

        if (!passwordOkResult.value) {
          return Err(
            AuthErrorFactory.makeCredentialFailure("invalid_password", {
              userId: user.id,
            }),
          );
        }

        return Ok(toAuthUserOutputDto(user));
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred during authentication.",
        operation: "loginUser",
      },
    );
  }
}
