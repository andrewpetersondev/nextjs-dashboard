import "server-only";

import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import { makeAuthUseCaseLogger } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { getDefaultRegistrationRole } from "@/modules/auth/domain/policies/registration.policy";
import { toAuthUserOutputDto } from "@/modules/auth/domain/policies/user-mapper.policy";
import type { UnitOfWorkContract } from "@/modules/auth/domain/repositories/unit-of-work.contract";
import type { AuthSignupSchemaDto } from "@/modules/auth/domain/schemas/auth-user.schema";
import type { PasswordHasherContract } from "@/modules/auth/domain/services/password-hasher.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * SignupUseCase
 *
 * Single business capability: Create a new user account.
 */
export class SignupUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly uow: UnitOfWorkContract;

  constructor(
    uow: UnitOfWorkContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.hasher = hasher;
    this.logger = makeAuthUseCaseLogger(logger, "signupUser");
    this.uow = uow;
  }

  /**
   * Executes the user creation process.
   * Assumes input has been validated at the boundary.
   */
  execute(
    input: Readonly<AuthSignupSchemaDto>,
  ): Promise<Result<AuthUserOutputDto, AppError>> {
    return safeExecute(
      () =>
        this.uow.withTransaction(async (tx) => {
          const passwordHash = await this.hasher.hash(input.password);

          const createdResultTx = await tx.authUsers.signup({
            email: input.email,
            password: passwordHash,
            role: getDefaultRegistrationRole(),
            username: input.username,
          });

          if (!createdResultTx.ok) {
            return createdResultTx;
          }

          return Ok(toAuthUserOutputDto(createdResultTx.value));
        }),
      {
        logger: this.logger,
        message: "An unexpected error occurred during user creation.",
        operation: "createUser",
      },
    );
  }
}
