import "server-only";
import { AuthErrorFactory } from "@/modules/auth/application/auth-user/auth-error.factory";
import type { AuthUserRepositoryContract } from "@/modules/auth/application/auth-user/contracts/repositories/auth-user-repository.contract";
import type { PasswordHasherContract } from "@/modules/auth/application/auth-user/contracts/services/password-hasher.contract";
import type { LoginCommand } from "@/modules/auth/application/auth-user/dtos/requests/login.command";
import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import { AUTH_USE_CASE_NAMES } from "@/modules/auth/application/shared/logging/auth-logging.constants";
import { makeAuthUseCaseLoggerHelper } from "@/modules/auth/application/shared/logging/make-auth-use-case-logger.helper";
import { toAuthenticatedUserDto } from "@/modules/auth/application/shared/mappers/flows/login/to-authenticated-user.mapper";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import { safeExecute } from "@/shared/core/result/safe-execute";
import { PerformanceTracker } from "@/shared/telemetry/core/performance-tracker";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

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
	 * Emits one login-step log with the tracker's timings attached.
	 *
	 * @param entry - Severity, message, tracker and identifiers for the step.
	 */
	private logStep(
		entry: Readonly<{
			identifiers: Record<string, unknown>;
			level: "info" | "warn";
			message: string;
			operationName: string;
			tracker: PerformanceTracker;
		}>,
	): void {
		const { identifiers, level, message, operationName, tracker } = entry;
		this.logger.operation(level, message, {
			duration: tracker.getTotalDuration(),
			operationContext: "auth:use-case",
			operationIdentifiers: identifiers,
			operationName,
			timings: tracker.getAllTimings(),
		});
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
	// biome-ignore lint/complexity/noExcessiveLinesPerFunction: linear Result pipeline — the length is the step count, and each step logs its own timing before returning, so any split would separate a step from the log that explains it.
	execute(
		input: Readonly<LoginCommand>,
	): Promise<Result<AuthenticatedUserDto, AppError>> {
		return safeExecute(
			// biome-ignore lint/complexity/noExcessiveLinesPerFunction: linear Result pipeline — the length is the step count, and each step logs its own timing before returning, so any split would separate a step from the log that explains it.
			async () => {
				const tracker = new PerformanceTracker();

				const userResult = await tracker.measure("repo.findByEmail", () =>
					this.repo.findByEmail({ email: input.email }),
				);

				if (!userResult.ok) {
					this.logStep({
						identifiers: { email: input.email },
						level: "warn",
						message: "Login use case failed at repository",
						operationName: "login.repo.failed",
						tracker,
					});
					return userResult;
				}

				const user = userResult.value;

				if (!user) {
					this.logStep({
						identifiers: { email: input.email },
						level: "warn",
						message: "Login use case: user not found",
						operationName: "login.user_not_found",
						tracker,
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
					this.logStep({
						identifiers: { email: input.email, userId: user.id },
						level: "warn",
						message: "Login use case failed at password hash",
						operationName: "login.hasher.failed",
						tracker,
					});
					return Err(passwordOkResult.error);
				}

				if (!passwordOkResult.value) {
					this.logStep({
						identifiers: { email: input.email, userId: user.id },
						level: "warn",
						message: "Login use case: invalid password",
						operationName: "login.invalid_password",
						tracker,
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

				this.logStep({
					identifiers: { email: input.email, userId: user.id },
					level: "info",
					message: "Login use case completed successfully",
					operationName: "login.success",
					tracker,
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
