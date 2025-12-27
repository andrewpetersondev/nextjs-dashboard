import "server-only";

import type { AuthUserRepositoryContract } from "@/modules/auth/server/application/types/contracts/auth-user.repository.contract";
import type { AuthLoginSchemaDto } from "@/modules/auth/shared/domain/user/auth-user.schema";
import type { AuthUserTransport } from "@/modules/auth/shared/types/transport/auth-user.transport";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
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
  ): Promise<Result<AuthUserTransport, AppError>> {
    const _logger = this.logger.child({ email: input.email });

    try {
      const userResult = await this.repo.login({ email: input.email });

      if (!userResult.ok) {
        return Err(userResult.error);
      }

      const user = userResult.value;

      if (!user) {
        return Err(
          normalizeUnknownToAppError(new Error("user_not_found"), "not_found"),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        user.password,
      );
      if (!passwordOk) {
        return Err(
          normalizeUnknownToAppError(
            new Error("invalid_password"),
            "invalid_credentials",
          ),
        );
      }

      return Ok({
        email: user.email,
        id: toUserId(user.id),
        role: parseUserRole(user.role),
        username: user.username,
      });
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
