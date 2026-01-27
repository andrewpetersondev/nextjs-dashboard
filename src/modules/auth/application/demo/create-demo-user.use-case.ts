import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import type { PasswordGeneratorContract } from "@/modules/auth/application/contracts/password-generator.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import { createDemoUserTxHelper } from "@/modules/auth/application/helpers/create-demo-user.tx.helper";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Handles the creation of a temporary demo user for specific roles.
 *
 * This use case manages the generation of a random password, hashing it,
 * and persisting the demo user in the database.
 */
export class CreateDemoUserUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly passwordGenerator: PasswordGeneratorContract;
  private readonly uow: AuthUnitOfWorkContract;

  /**
   * @param uow - Unit of Work for transactional database operations.
   * @param hasher - Service for hashing user passwords.
   * @param passwordGenerator - Service for generating compliant random passwords.
   * @param logger - Logging client for audit and debugging.
   */
  constructor(
    uow: AuthUnitOfWorkContract,
    hasher: PasswordHasherContract,
    passwordGenerator: PasswordGeneratorContract,
    logger: LoggingClientContract,
  ) {
    this.logger = makeAuthUseCaseLoggerHelper(logger, "createDemoUser");
    this.hasher = hasher;
    this.passwordGenerator = passwordGenerator;
    this.uow = uow;
  }

  /**
   * Executes the demo user creation logic.
   *
   * @param role - The role to assign to the new demo user.
   * @returns A Result containing the created user DTO or an AppError.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
   */
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
