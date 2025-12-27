import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/server/application/contracts/unit-of-work.contract";
import { toSignupUniquenessConflict } from "@/modules/auth/server/application/services/auth-error-mapper.service";
import type { AuthUserTransport } from "@/modules/auth/shared/contracts/auth-user.transport";
import type { SignupData } from "@/modules/auth/shared/domain/user/auth.schema";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export class SignupUseCase {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientPort;
  private readonly uow: UnitOfWorkContract;

  constructor(
    uow: UnitOfWorkContract,
    hasher: HashingService,
    logger: LoggingClientPort,
  ) {
    this.hasher = hasher;
    this.logger = logger.child({ scope: "use-case", useCase: "createUser" });
    this.uow = uow;
  }

  /**
   * Executes the user creation process.
   * Assumes input has been validated at the boundary.
   */
  async execute(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const _logger = this.logger.child({ email: input.email });

    try {
      const createdResult = await this.uow.withTransaction(async (tx) => {
        const passwordHash = await this.hasher.hash(input.password);

        const createdResultTx = await tx.authUsers.signup({
          email: input.email,
          password: passwordHash,
          role: parseUserRole("USER"),
          username: input.username,
        });

        if (!createdResultTx.ok) {
          const mapped = toSignupUniquenessConflict(createdResultTx.error);
          return Err(mapped ?? createdResultTx.error);
        }

        const created = createdResultTx.value;

        return Ok<AuthUserTransport>({
          email: created.email,
          id: toUserId(created.id),
          role: parseUserRole(created.role),
          username: created.username,
        });
      });

      return createdResult;
    } catch (err: unknown) {
      const error = makeUnexpectedError(err, {
        message: "An unexpected error occurred during user creation.",
        metadata: { operation: "createUser" },
      });

      return Err(error);
    }
  }
}
