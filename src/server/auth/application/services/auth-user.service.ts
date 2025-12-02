// src/server/auth/application/services/auth-user.service.ts
import "server-only";
import { createRandomPassword } from "@/features/auth/lib/auth.password";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { asPasswordHash } from "@/features/auth/lib/password.types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import type { AuthUserRepositoryPort } from "@/server/auth/application/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/application/ports/password-hasher.port";
import { hasRequiredSignupFields } from "@/server/auth/domain/auth.guards";
import { toAuthUserTransport } from "@/server/auth/domain/auth.mappers";
import type { AuthUserTransport } from "@/server/auth/domain/auth.types";
import { demoUserCounter } from "@/server/auth/infrastructure/repository/dal/demo-user-counter";
import { AuthLog, logAuth } from "@/server/auth/logging/auth-log";
import { getAppDb } from "@/server/db/db.connection";
import { Err, Ok } from "@/shared/application/result/result";
import type { Result } from "@/shared/application/result/result.types";
import type { AppError } from "@/shared/infrastructure/errors/core/app-error.class";
import { normalizeToAppError } from "@/shared/infrastructure/errors/normalizers/app-error.normalizer";
import type { LoggingClientContract } from "@/shared/infrastructure/logging/core/logger.contracts";

/**
 * AuthUserService orchestrates authentication and user creation logic.
 *
 * @remarks
 * - Returns discriminated Result objects instead of throwing.
 * - Depends on small ports (AuthUserRepositoryPort, PasswordHasherPort) for testability.
 */
export class AuthUserService {
  private readonly repo: AuthUserRepositoryPort;
  private readonly hasher: PasswordHasherPort;
  private readonly logger: LoggingClientContract;

  constructor(
    repo: AuthUserRepositoryPort,
    hasher: PasswordHasherPort,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    // Create a child logger for this service instance with "service" scope
    this.logger = logger.child({ scope: "service" });
  }

  /**
   * Creates a demo user with a unique username and email for the given role.
   *
   * @param role - The role assigned to the demo user.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks Uses repository transaction support and the password hasher port.
   */
  async createDemoUser(
    role: UserRole,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const requestId = crypto.randomUUID();

    try {
      const db = getAppDb();
      const counter = await demoUserCounter(db, role, this.logger, requestId);

      if (!counter || counter <= 0) {
        const error = normalizeToAppError(
          new Error("invalid_counter"),
          "validation",
        );
        logAuth(
          "error",
          "Invalid demo user counter",
          AuthLog.service.demoUser.error(error, { role }),
          { additionalData: { counter }, requestId },
        );
        return Err(error);
      }

      const demoPassword = createRandomPassword();
      const uniqueEmail = `demo+${role}${counter}@demo.com`;
      const uniqueUsername = `Demo_${role.toUpperCase()}_${counter}`;
      const passwordHash = await this.hasher.hash(demoPassword);

      const demoUser = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: uniqueEmail,
          password: passwordHash,
          role,
          username: uniqueUsername,
        }),
      );

      logAuth(
        "info",
        "Demo user created",
        AuthLog.service.demoUser.success({ role }),
        {
          additionalData: { email: uniqueEmail, username: uniqueUsername },
          requestId,
        },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      const error = normalizeToAppError(err, "unexpected");
      logAuth(
        "error",
        "Demo user creation failed",
        AuthLog.service.demoUser.error(error, { role }),
        { requestId },
      );
      return Err(error);
    }
  }

  /**
   * Service method for handling user signup flow.
   * Only handles domain/infra errors from repository layer, never DB/PG errors directly.
   *
   * @param input - Readonly SignupData containing email, username and password.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks The password is hashed and the operation is performed inside a repository transaction.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const requestId = crypto.randomUUID();

    if (!hasRequiredSignupFields(input)) {
      const error = normalizeToAppError(
        new Error("missing_fields"),
        "missingFields",
      );
      logAuth(
        "warn",
        "Missing required signup fields",
        AuthLog.service.signup.error(error, {
          email: input.email,
          username: input.username,
        }),
        { requestId },
      );
      return Err(error);
    }

    try {
      const passwordHash = await this.hasher.hash(input.password);
      const demoUser = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: input.email,
          password: passwordHash,
          role: toUserRole("user"),
          username: input.username,
        }),
      );

      logAuth(
        "info",
        "Signup service success",
        AuthLog.service.signup.success({ email: input.email }),
        { requestId },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      const error = normalizeToAppError(err, "unexpected");
      logAuth(
        "error",
        "Signup service failed",
        AuthLog.service.signup.error(error, { email: input.email }),
        { requestId },
      );
      return Err(error);
    }
  }

  /**
   * Authenticate a user by email and password.
   *
   * @param input - Readonly LoginData with email and password.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks
   * - Repository returns `AuthUserEntity | null` and does not encode auth semantics.
   * - This method owns "invalid credentials" semantics and mapping to AppError.
   * - All infra/repo errors are mapped via `mapAppErrorToFormPayload` into AppError.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: login flow is inherently multi-step
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const requestId = crypto.randomUUID();

    try {
      const user = await this.repo.login({ email: input.email });

      if (!user) {
        const error = normalizeToAppError(
          new Error("user_not_found"),
          "notFound",
        );
        logAuth(
          "warn",
          "Login failed - user not found",
          AuthLog.service.login.error(error, { email: input.email }),
          { requestId },
        );
        return Err(error);
      }

      if (!user.password) {
        const error = normalizeToAppError(
          new Error("missing_password_hash"),
          "validation",
        );
        logAuth(
          "error",
          "Login failed - missing password hash",
          AuthLog.service.login.error(error, {
            email: input.email,
            userId: String(user.id),
          }),
          { requestId },
        );
        return Err(error);
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );

      if (!passwordOk) {
        const error = normalizeToAppError(
          new Error("invalid_password"),
          "invalidCredentials",
        );
        logAuth(
          "warn",
          "Login failed - invalid password",
          AuthLog.service.login.error(error, { email: input.email }),
          { requestId },
        );
        return Err(error);
      }

      logAuth(
        "info",
        "Login succeeded",
        AuthLog.service.login.success({ email: input.email }),
        { additionalData: { userId: String(user.id) }, requestId },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      const error = normalizeToAppError(err, "unexpected");
      logAuth(
        "error",
        "Login service unexpected error",
        AuthLog.service.login.error(error, { email: input.email }),
        { requestId },
      );
      return Err(error);
    }
  }
}
