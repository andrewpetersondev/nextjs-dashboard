import "server-only";

import type { AuthLoginInputDto } from "@/modules/auth/application/dtos/auth-login.input.dto";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import { applyAntiEnumerationPolicy } from "@/modules/auth/domain/policies/auth-security.policy";
import type { AuthUserRepositoryContract } from "@/modules/auth/domain/repositories/auth-user-repository.contract";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import {
  makeAppError,
  normalizeUnknownToAppError,
} from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

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

  async execute(
    input: Readonly<AuthLoginInputDto>,
  ): Promise<Result<AuthUserOutputDto, AppError>> {
    try {
      const userResult = await this.repo.findByEmail({ email: input.email });

      if (!userResult.ok) {
        return userResult;
      }

      const user = userResult.value;

      if (!user) {
        return Err(
          applyAntiEnumerationPolicy(
            makeAppError("not_found", {
              cause: "user_not_found",
              message: "User does not exist.",
              metadata: { email: input.email },
            }),
          ),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        user.password,
      );
      if (!passwordOk) {
        return Err(
          applyAntiEnumerationPolicy(
            makeAppError("invalid_credentials", {
              cause: "invalid_password",
              message: "Password does not match.",
              metadata: { userId: user.id },
            }),
          ),
        );
      }

      return Ok({
        email: user.email,
        id: user.id,
        role: user.role,
        username: user.username,
      });
    } catch (err: unknown) {
      this.logger.error("login.use-case.execute failed. error catch block");
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
