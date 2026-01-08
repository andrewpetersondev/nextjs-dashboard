import "server-only";

import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import {
  generateDemoUserIdentity,
  makeInvalidDemoCounterError,
  validateDemoUserCounter,
} from "@/modules/auth/domain/policies/registration.policy";
import { toAuthUserOutputDto } from "@/modules/auth/domain/policies/user-mapper.policy";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import type { PasswordGeneratorContract } from "@/modules/auth/domain/services/password-generator.contract";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import { toSignupUniquenessConflict } from "@/modules/auth/infrastructure/persistence/mappers/auth-error.mapper";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export class CreateDemoUserUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly passwordGenerator: PasswordGeneratorContract;
  private readonly uow: UnitOfWorkContract;

  constructor(
    uow: UnitOfWorkContract,
    hasher: PasswordHasherContract,
    passwordGenerator: PasswordGeneratorContract,
    logger: LoggingClientContract,
  ) {
    this.logger = logger.child({
      scope: "use-case",
      useCase: "createDemoUser",
    });
    this.hasher = hasher;
    this.passwordGenerator = passwordGenerator;
    this.uow = uow;
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <extract policy logic>
  async execute(role: UserRole): Promise<Result<AuthUserOutputDto, AppError>> {
    const logger = this.logger.child({ role });

    try {
      const demoPassword = this.passwordGenerator.generate(10);
      const passwordHash = await this.hasher.hash(demoPassword);

      const txResult = await this.uow.withTransaction(async (tx) => {
        const counter = await tx.authUsers.incrementDemoUserCounter(role);

        if (!validateDemoUserCounter(counter)) {
          return Err(makeInvalidDemoCounterError(counter));
        }

        const { email, username } = generateDemoUserIdentity(role, counter);

        const createdResult = await tx.authUsers.signup({
          email,
          password: passwordHash,
          role,
          username,
        });

        if (!createdResult.ok) {
          const mapped = toSignupUniquenessConflict(createdResult.error);
          return Err(mapped ?? createdResult.error);
        }

        const created = createdResult.value;

        return Ok<AuthUserOutputDto>(toAuthUserOutputDto(created));
      });

      if (!txResult.ok) {
        logger.operation("warn", "Create demo user failed", {
          error: txResult.error,
          operationContext: "create-demo-user.use-case",
          operationIdentifiers: { role },
          operationName: "demoUser.failed",
        });

        return Err(txResult.error);
      }

      logger.operation("info", "Create demo user succeeded", {
        operationContext: "create-demo-user.use-case",
        operationIdentifiers: { role },
        operationName: "demoUser.success",
      });

      return Ok(txResult.value);
    } catch (err: unknown) {
      const error = makeUnexpectedError(err, {
        message: "demoUser.unexpected",
        metadata: { role },
      });

      logger.operation("error", "Create demo user unexpected error", {
        error,
        operationContext: "create-demo-user.use-case",
        operationIdentifiers: { role },
        operationName: "demoUser.unexpected",
      });

      return Err(error);
    }
  }
}
