import "server-only";

import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import type { AuthUserTransport } from "@/modules/auth/shared/contracts/auth-user.transport";
import type { LoginData } from "@/modules/auth/shared/domain/user/auth.schema";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownToAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Maps database/entity representation to transport-safe AuthUserTransport.
 * Validates and converts all fields to ensure type safety across boundaries.
 */
const toAuthUserTransport = (src: {
  readonly email: string;
  readonly id: string;
  readonly role: string;
  readonly username: string;
}): AuthUserTransport => {
  if (!(src.email && src.id && src.role && src.username)) {
    throw new Error("Invalid user entity: missing required fields");
  }
  return {
    email: src.email,
    id: toUserId(src.id),
    role: parseUserRole(src.role),
    username: src.username,
  };
};

/**
 * AuthUserService orchestrates authentication logic.
 *
 * @remarks
 * - Returns discriminated Result objects instead of throwing (for expected failures).
 * - Depends on small ports (AuthUserRepositoryPort, HashingService) for testability.
 *
 * NOTE: user creation (signup/demo user) is handled via use-cases that own transactions
 * through UnitOfWorkPort.
 */
export class AuthUserService {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientPort;
  private readonly repo: AuthUserRepositoryPort;

  constructor(
    repo: AuthUserRepositoryPort,
    hasher: HashingService,
    logger: LoggingClientPort,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.withContext("auth:service");
  }

  /**
   * Authenticate a user by email and password.
   *
   * @param input - Readonly LoginData with email and password.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks
   * - Repository returns `AuthUserEntity | null` and does not encode auth semantics.
   * - This method owns "invalid credentials" semantics and mapping to AppError.
   * - Login is read-only; no transaction needed.
   */
  async login(
    input: Readonly<LoginData>,
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

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      return Err(normalizeUnknownToAppError(err, "unexpected"));
    }
  }
}
