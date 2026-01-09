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
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

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

  execute(role: UserRole): Promise<Result<AuthUserOutputDto, AppError>> {
    return safeExecute(
      async () => {
        // 1. Preparation (Non-transactional side effects)
        const demoPassword = this.passwordGenerator.generate(10);
        const passwordHash = await this.hasher.hash(demoPassword);

        // 2. Persistence (Transactional boundary)
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

          return Ok(toAuthUserOutputDto(createdResult.value));
        });

        if (txResult.ok) {
          this.logger.operation("info", "Create demo user succeeded", {
            operationContext: "create-demo-user.use-case",
            operationIdentifiers: { role },
            operationName: "demoUser.success",
          });
        }

        return txResult;
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while creating a demo user.",
        operation: "createDemoUser",
      },
    );
  }
}
