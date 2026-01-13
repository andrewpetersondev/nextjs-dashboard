import "server-only";

import type { UnitOfWorkContract } from "@/modules/auth/application/contracts/unit-of-work.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import { createDemoUserTxHelper } from "@/modules/auth/application/helpers/create-demo-user.tx.helper";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import type { PasswordGeneratorContract } from "@/modules/auth/domain/services/password-generator.contract";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
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
    this.logger = makeAuthUseCaseLoggerHelper(logger, "createDemoUser");
    this.hasher = hasher;
    this.passwordGenerator = passwordGenerator;
    this.uow = uow;
  }

  execute(role: UserRole): Promise<Result<AuthenticatedUserDto, AppError>> {
    return safeExecute<AuthenticatedUserDto>(
      async () => {
        const result = await createDemoUserTxHelper(
          {
            hasher: this.hasher,
            passwordGenerator: this.passwordGenerator,
            uow: this.uow,
          },
          role,
        );

        if (result.ok) {
          this.logger.operation("info", "Create demo user succeeded", {
            operationContext: "auth",
            operationIdentifiers: { role, userId: result.value.id },
            operationName: "auth.demo_user.success",
          });
        }

        return result;
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred while creating a demo user.",
        operation: "createDemoUser",
      },
    );
  }
}
