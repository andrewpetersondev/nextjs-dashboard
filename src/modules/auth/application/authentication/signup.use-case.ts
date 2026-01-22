import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/contracts/auth-unit-of-work.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/contracts/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/helpers/make-auth-use-case-logger.helper";
import { toAuthUserOutputDto } from "@/modules/auth/application/mappers/to-auth-user-output-dto.mapper";
import type { SignupRequestDto } from "@/modules/auth/application/schemas/login-request.schema";
import { getDefaultRegistrationRole } from "@/modules/auth/domain/policies/registration.policy";
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
  private readonly uow: AuthUnitOfWorkContract;

  constructor(
    uow: AuthUnitOfWorkContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.hasher = hasher;
    this.logger = makeAuthUseCaseLoggerHelper(logger, "signupUser");
    this.uow = uow;
  }

  /**
   * Executes the user creation process.
   * Assumes input has been validated at the boundary.
   */
  execute(
    input: Readonly<SignupRequestDto>,
  ): Promise<Result<AuthenticatedUserDto, AppError>> {
    return safeExecute(
      () =>
        this.uow.withTransaction(async (tx) => {
          const hashResult = await this.hasher.hash(input.password);

          if (!hashResult.ok) {
            return hashResult;
          }

          const createdResultTx = await tx.authUsers.signup({
            email: input.email,
            password: hashResult.value,
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
