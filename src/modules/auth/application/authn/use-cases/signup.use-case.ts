import "server-only";
import type { AuthUnitOfWorkContract } from "@/modules/auth/application/authn/contracts/auth-unit-of-work.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/authn/contracts/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/authn/dtos/authenticated-user.dto";
import { toAuthenticatedUserDto } from "@/modules/auth/application/authn/mappers/to-authenticated-user.mapper";
import type { SignupRequestDto } from "@/modules/auth/application/authn/schemas/signup-request.schema";
import { AUTH_USE_CASE_NAMES } from "@/modules/auth/application/constants/auth-logging.constants";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/factories/make-auth-use-case-logger.helper";
import { getDefaultRegistrationRole } from "@/modules/auth/domain/auth-user/policies/registration.policy";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Handles the creation of a new user account.
 *
 * This use case manages the signup process, including password hashing,
 * determining the default role, and persisting the new user record
 * within a transaction.
 */
export class SignupUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly uow: AuthUnitOfWorkContract;

  /**
   * @param uow - Unit of Work for transactional database operations.
   * @param hasher - Service for hashing user passwords.
   * @param logger - Logging client for audit and debugging.
   */
  constructor(
    uow: AuthUnitOfWorkContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.hasher = hasher;
    this.logger = makeAuthUseCaseLoggerHelper(
      logger,
      AUTH_USE_CASE_NAMES.SIGNUP_USER,
    );
    this.uow = uow;
  }

  /**
   * Executes the user creation process.
   *
   * @param input - The signup request data (email, password, username).
   * @returns A Result containing the created user DTO or an AppError.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result).
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

          return Ok(toAuthenticatedUserDto(createdResultTx.value));
        }),
      {
        logger: this.logger,
        message: "An unexpected error occurred during user creation.",
        operation: AUTH_USE_CASE_NAMES.SIGNUP_USER,
      },
    );
  }
}
