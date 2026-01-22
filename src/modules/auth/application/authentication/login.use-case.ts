import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user-repository.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import { AuthErrorFactory } from "@/modules/auth/application/factories/auth-error.factory";
import { toAuthUserOutputDto } from "@/modules/auth/application/mappers/to-auth-user-output-dto.mapper";
import type { LoginRequestDto } from "@/modules/auth/application/schemas/login-request.schema";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * LoginUseCase
 *
 * Single business capability: Authenticate a user by email/password.
 */
export class LoginUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly repo: AuthUserRepositoryContract;

  constructor(
    repo: AuthUserRepositoryContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.withContext("auth:use-case:login-user");
  }

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

        const passwordOk = await this.hasher.compare(
          input.password,
          user.password,
        );
        if (!passwordOk) {
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
