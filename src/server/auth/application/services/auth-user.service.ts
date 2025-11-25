// src/server/auth/application/services/auth-user.service.ts
import "server-only";
import { createRandomPassword } from "@/features/auth/lib/auth.password";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { asPasswordHash } from "@/features/auth/lib/password.types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import type { AuthUserRepositoryPort } from "@/server/auth/application/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/application/ports/password-hasher.port";
import { toAuthUserTransport } from "@/server/auth/domain/mappers/user-transport.mapper";
import { hasRequiredSignupFields } from "@/server/auth/domain/types/auth-signup.presence-guard";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import { demoUserCounter } from "@/server/auth/infrastructure/repository/dal/demo-user-counter";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import { getAppDb } from "@/server/db/db.connection";
import type { BaseError } from "@/shared/errors/core/base-error";
import {
  makeUnexpectedError,
  makeValidationError,
} from "@/shared/errors/core/base-error.factory";
import { normalizeToBaseError } from "@/shared/errors/core/error.utils";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import type { Result } from "@/shared/result/result";
import { Err, Ok } from "@/shared/result/result";

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
   * @returns A discriminated Result containing AuthUserTransport on success or BaseError on failure.
   *
   * @remarks Uses repository transaction support and the password hasher port.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
  async createDemoUser(
    role: UserRole,
  ): Promise<Result<AuthUserTransport, BaseError>> {
    const requestId = crypto.randomUUID();

    logAuth(
      "info",
      "Demo user creation start",
      AuthLog.service.demoUser.start({ role }),
      { requestId },
    );

    try {
      const db = getAppDb();
      const counter = await demoUserCounter(db, role, this.logger, requestId);

      if (!counter || counter <= 0) {
        logAuth(
          "error",
          "Invalid demo user counter",
          AuthLog.service.demoUser.error(new Error("invalid_counter"), {
            role,
          }),
          { additionalData: { counter }, requestId },
        );
        return Err(
          makeUnexpectedError({
            metadata: {
              counter,
              formErrors: ["Failed to generate demo user"],
              reason: "invalid_demo_user_counter",
              role,
            },
          }),
        );
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
      const normalized = normalizeToBaseError(err, "unexpected");
      logAuth(
        "error",
        "Demo user creation failed",
        AuthLog.service.demoUser.error(normalized, { role }),
        { requestId },
      );
      return Err(normalized);
    }
  }

  /**
   * Service method for handling user signup flow.
   * Only handles domain/infra errors from repository layer, never DB/PG errors directly.
   *
   * @param input - Readonly SignupData containing email, username and password.
   * @returns A discriminated Result containing AuthUserTransport on success or BaseError on failure.
   *
   * @remarks The password is hashed and the operation is performed inside a repository transaction.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, BaseError>> {
    const requestId = crypto.randomUUID();
    logAuth(
      "info",
      "Signup service start",
      AuthLog.service.signup.start({
        email: input.email,
        username: input.username,
      }),
      { requestId },
    );

    if (!hasRequiredSignupFields(input)) {
      logAuth(
        "warn",
        "Missing required signup fields",
        AuthLog.service.signup.error(new Error("missing_fields"), {
          email: input.email,
          username: input.username,
        }),
        { requestId },
      );
      return Err(
        makeValidationError({
          metadata: {
            fieldErrors: { email: ["Missing"], username: ["Missing"] },
            reason: "missing_fields",
          },
        }),
      );
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
      const normalized = normalizeToBaseError(err, "unexpected");
      logAuth(
        "error",
        "Signup service failed",
        AuthLog.service.signup.error(normalized, { email: input.email }),
        { requestId },
      );
      return Err(normalized);
    }
  }

  /**
   * Authenticate a user by email and password.
   *
   * @param input - Readonly LoginData with email and password.
   * @returns A discriminated Result containing AuthUserTransport on success or BaseError on failure.
   *
   * @remarks
   * - Repository returns `AuthUserEntity | null` and does not encode auth semantics.
   * - This method owns "invalid credentials" semantics and mapping to BaseError.
   * - All infra/repo errors are mapped via `mapBaseErrorToFormPayload` into BaseError.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: login flow is inherently multi-step
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<AuthUserTransport, BaseError>> {
    const requestId = crypto.randomUUID();
    logAuth(
      "info",
      "Login service start",
      AuthLog.service.login.start({ email: input.email }),
      { requestId },
    );

    try {
      const user = await this.repo.login({ email: input.email });

      if (!user) {
        logAuth(
          "warn",
          "Login failed - invalid credentials",
          AuthLog.service.login.error(new Error("user_not_found"), {
            email: input.email,
          }),
          { requestId },
        );
        return Err(
          makeValidationError({
            metadata: {
              fieldErrors: {
                email: ["invalid_credentials"],
                password: ["invalid_credentials"],
              },
              formErrors: ["Invalid credentials"],
              reason: "invalid_credentials_user_not_found_or_no_password",
            },
          }),
        );
      }

      if (!user.password) {
        logAuth(
          "error",
          "Login failed - missing password hash",
          AuthLog.service.login.error(new Error("missing_password_hash"), {
            email: input.email,
            userId: String(user.id),
          }),
          { requestId },
        );
        return Err(
          makeValidationError({
            metadata: {
              fieldErrors: {
                email: ["invalid_credentials"],
                password: ["invalid_credentials"],
              },
              formErrors: ["Invalid credentials"],
              reason: "missing_password_hash_on_user_entity",
              userId: String(user.id),
            },
          }),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );

      if (!passwordOk) {
        logAuth(
          "warn",
          "Login failed - invalid password",
          AuthLog.service.login.error(new Error("password_mismatch"), {
            email: input.email,
          }),
          { requestId },
        );
        return Err(
          makeValidationError({
            metadata: {
              fieldErrors: {
                email: ["invalid_credentials"],
                password: ["invalid_credentials"],
              },
              formErrors: ["Invalid credentials"],
              reason: "invalid_credentials_password_mismatch",
            },
          }),
        );
      }

      logAuth(
        "info",
        "Login succeeded",
        AuthLog.service.login.success({ email: input.email }),
        { additionalData: { userId: String(user.id) }, requestId },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      const baseError = normalizeToBaseError(err, "unexpected");
      logAuth(
        "error",
        "Login service unexpected error",
        AuthLog.service.login.error(baseError, { email: input.email }),
        { requestId },
      );
      return Err(baseError);
    }
  }
}
