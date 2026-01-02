import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/application/contracts/auth-user.repository.contract";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { AuthLoginSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import {
  makeAppError,
  normalizeUnknownToAppError,
} from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * LoginUseCase
 *
 * Single business capability: Authenticate a user by email/password.
 */
export class LoginUseCase {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientPort;
  private readonly repo: AuthUserRepositoryContract;

  constructor(
    repo: AuthUserRepositoryContract,
    hasher: HashingService,
    logger: LoggingClientPort,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.withContext("auth:use-case:login-user");
  }

  async execute(
    input: Readonly<AuthLoginSchemaDto>,
  ): Promise<Result<AuthUserOutputDto, AppError>> {
    try {
      const userResult = await this.repo.login({ email: input.email });

      if (!userResult.ok) {
        return userResult;
      }

      const user = userResult.value;

      if (!user) {
        return Err(
          makeAppError("not_found", {
            cause: "user_not_found",
            message: "user_not_found",
            metadata: { email: input.email },
          }),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        user.password,
      );
      if (!passwordOk) {
        return Err(
          makeAppError("invalid_credentials", {
            cause: "invalid_password",
            message: "invalid_password",
            metadata: { userId: user.id },
          }),
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
