import "server-only";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/auth-user/contracts/repositories/auth-user-repository.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/auth-user/contracts/services/password-hasher.contract";
import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import { AuthErrorFactory } from "@/modules/auth/application/auth-user/errors/auth-error.factory";
import type { LoginRequestDto } from "@/modules/auth/application/auth-user/schemas/login-request.schema";
import { AUTH_USE_CASE_NAMES } from "@/modules/auth/application/shared/logging/auth-logging.constants";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/shared/logging/make-auth-use-case-logger.helper";
import { toAuthenticatedUserDto } from "@/modules/auth/application/shared/mappers/flows/login/to-authenticated-user.mapper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { safeExecute } from "@/shared/results/safe-execute";

/**
 * Authenticates a user by validating their credentials against stored records.
 *
 * This use case handles the core business logic for user authentication,
 * including user lookup, password verification, and mapping to a safe DTO.
 */
export class LoginUseCase {
  private readonly hasher: PasswordHasherContract;
  private readonly logger: LoggingClientContract;
  private readonly repo: AuthUserRepositoryContract;

  /**
   * @param repo - Repository for accessing user authentication data.
   * @param hasher - Service for hashing and comparing passwords.
   * @param logger - Logging client for audit and debugging.
   */
  constructor(
    repo: AuthUserRepositoryContract,
    hasher: PasswordHasherContract,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = makeAuthUseCaseLoggerHelper(
      logger,
      AUTH_USE_CASE_NAMES.LOGIN_USER,
    );
  }

  /**
   * Executes the login business logic.
   *
   * @param input - The login credentials (email and password).
   * @returns A promise resolving to a {@link Result} containing the authenticated user DTO or an {@link AppError}.
   *
   * @remarks
   * Potential error scenarios (returned as Err):
   * - 'user_not_found': No user exists with the provided email.
   * - 'invalid_password': The password does not match the stored hash.
   * - Other infrastructure or validation errors.
   *
   * @throws {Error} If an unexpected system failure occurs (wrapped in Result by safeExecute).
   */
  execute(
    input: Readonly<LoginRequestDto>,
  ): Promise<Result<AuthenticatedUserDto, AppError>> {
    return safeExecute(
      async () => {
        const tracker = new PerformanceTracker();

        const userResult = await tracker.measure("repo.findByEmail", () =>
          this.repo.findByEmail({ email: input.email }),
        );

        if (!userResult.ok) {
          this.logger.operation("warn", "Login use case failed at repository", {
            duration: tracker.getTotalDuration(),
            operationContext: "auth:use-case",
            operationIdentifiers: { email: input.email },
            operationName: "login.repo.failed",
            timings: tracker.getAllTimings(),
          });
          return userResult;
        }

        const user = userResult.value;

        if (!user) {
          this.logger.operation("warn", "Login use case: user not found", {
            duration: tracker.getTotalDuration(),
            operationContext: "auth:use-case",
            operationIdentifiers: { email: input.email },
            operationName: "login.user_not_found",
            timings: tracker.getAllTimings(),
          });
          return Err(
            AuthErrorFactory.makeCredentialFailure("user_not_found", {
              email: input.email,
            }),
          );
        }

        const passwordOkResult = await tracker.measure("hasher.compare", () =>
          this.hasher.compare(input.password, user.password),
        );

        if (!passwordOkResult.ok) {
          this.logger.operation(
            "warn",
            "Login use case failed at password hash",
            {
              duration: tracker.getTotalDuration(),
              operationContext: "auth:use-case",
              operationIdentifiers: { email: input.email, userId: user.id },
              operationName: "login.hasher.failed",
              timings: tracker.getAllTimings(),
            },
          );
          return Err(passwordOkResult.error);
        }

        if (!passwordOkResult.value) {
          this.logger.operation("warn", "Login use case: invalid password", {
            duration: tracker.getTotalDuration(),
            operationContext: "auth:use-case",
            operationIdentifiers: { email: input.email, userId: user.id },
            operationName: "login.invalid_password",
            timings: tracker.getAllTimings(),
          });
          return Err(
            AuthErrorFactory.makeCredentialFailure("invalid_password", {
              userId: user.id,
            }),
          );
        }

        const authenticatedUser = tracker.measureSync(
          "mapper.toAuthenticatedUserDto",
          () => toAuthenticatedUserDto(user),
        );

        this.logger.operation("info", "Login use case completed successfully", {
          duration: tracker.getTotalDuration(),
          operationContext: "auth:use-case",
          operationIdentifiers: { email: input.email, userId: user.id },
          operationName: "login.success",
          timings: tracker.getAllTimings(),
        });

        return Ok(authenticatedUser);
      },
      {
        logger: this.logger,
        message: "An unexpected error occurred during authentication.",
        operation: AUTH_USE_CASE_NAMES.LOGIN_USER,
      },
    );
  }
}
