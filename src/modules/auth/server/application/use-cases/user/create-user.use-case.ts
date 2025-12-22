import "server-only";

import type { UnitOfWorkPort } from "@/modules/auth/server/application/ports/unit-of-work.port";
import { toSignupUniquenessConflict } from "@/modules/auth/server/application/services/auth-error-mapper.service";
import type { AuthUserTransport } from "@/modules/auth/shared/contracts/auth-user.transport";
import type { SignupData } from "@/modules/auth/shared/domain/user/auth.schema";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import type { AppError } from "@/shared/errors/core/app-error";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

export class CreateUserUseCase {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientContract;
  private readonly uow: UnitOfWorkPort;

  constructor(
    uow: UnitOfWorkPort,
    hasher: HashingService,
    logger: LoggingClientContract,
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
    const logger = this.logger.child({ email: input.email });

    try {
      const passwordHash = await this.hasher.hash(input.password);

      const createdResult = await this.uow.withTransaction(async (tx) => {
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

      if (!createdResult.ok) {
        return Err(createdResult.error);
      }

      logger.operation("info", "User created", {
        operationName: "signup.user.created",
      });

      return Ok(createdResult.value);
    } catch (err: unknown) {
      const error = makeUnexpectedError(err, {
        message: "signup.user.create.unexpected",
        metadata: { operation: "createUser" },
      });

      logger.operation("error", "User creation failed", {
        error,
        operationName: "signup.user.create.failed",
      });

      return Err(error);
    }
  }
}
