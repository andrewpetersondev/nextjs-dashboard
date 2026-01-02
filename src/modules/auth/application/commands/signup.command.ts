import "server-only";

import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { AuthSignupSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import { toSignupUniquenessConflict } from "@/modules/auth/infrastructure/adapters/auth-error-mapper.service";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export class SignupCommand {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly uow: UnitOfWorkContract;

  constructor(
    uow: UnitOfWorkContract,
    hasher: PasswordHasherContract,
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
    input: Readonly<AuthSignupSchemaDto>,
  ): Promise<Result<AuthUserOutputDto, AppError>> {
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

        return Ok<AuthUserOutputDto>({
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
