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
import {
  type AuthLogLayerContext,
  createAuthOperationContext,
  toLoggingContext,
} from "@/server/auth/logging-auth/auth-layer-context";
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
  private readonly baseLog: LoggingClientContract;

  constructor(
    repo: AuthUserRepositoryPort,
    hasher: PasswordHasherPort,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.baseLog = logger.withContext("auth.user.service");
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
    const serviceContext: AuthLogLayerContext<"service"> =
      createAuthOperationContext({
        identifiers: { role },
        layer: "service",
        operation: "demoUser",
      });

    const log = this.baseLog.withContext(serviceContext.loggerContext);

    try {
      const db = getAppDb();
      const counter = await demoUserCounter(db, role);

      if (!counter || counter <= 0) {
        log.operation("error", "Invalid demo user counter", {
          details: { counter, reason: "invalid_demo_user_counter" },
          operationIdentifiers: serviceContext.identifiers,
          operationName: serviceContext.operation,
        });

        return Err(
          makeUnexpectedError({
            context: {
              counter,
              operation: serviceContext.operation,
              reason: "invalid_demo_user_counter",
              role,
            },
            formErrors: ["Failed to generate demo user"],
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

      log.operation("info", "Demo user created", {
        details: { email: uniqueEmail, username: uniqueUsername },
        operationIdentifiers: serviceContext.identifiers,
        operationName: serviceContext.operation,
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      log.errorWithDetails(
        "Failed to create demo user",
        err,
        toLoggingContext(serviceContext),
      );

      const normalized = normalizeToBaseError(err, "unexpected");

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
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, BaseError>> {
    const serviceContext: AuthLogLayerContext<"service"> =
      createAuthOperationContext({
        identifiers: {
          email: input.email,
          username: input.username,
        },
        layer: "service",
        operation: "signup",
      });

    const log = this.baseLog.withContext(serviceContext.loggerContext);

    if (!hasRequiredSignupFields(input)) {
      log.operation("warn", "Missing required signup fields", {
        details: { email: input.email, username: input.username },
        operationIdentifiers: serviceContext.identifiers,
        operationName: serviceContext.operation,
      });

      return Err(
        makeValidationError({
          context: {
            identifiers: serviceContext.identifiers,
            operation: serviceContext.operation,
            reason: "missing_fields",
          },
          fieldErrors: {
            email: ["missing_fields"],
            password: ["missing_fields"],
            username: ["missing_fields"],
          },
          formErrors: ["Missing required signup fields"],
        }),
      );
    }

    try {
      const passwordHash = await this.hasher.hash(input.password);

      const userRow = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: input.email,
          password: passwordHash,
          role: toUserRole("USER"),
          username: input.username,
        }),
      );

      log.operation("info", "Signup succeeded", {
        details: { email: input.email, username: input.username },
        operationIdentifiers: serviceContext.identifiers,
        operationName: serviceContext.operation,
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(userRow));
    } catch (err: unknown) {
      log.errorWithDetails(
        "Signup failed",
        err,
        toLoggingContext(serviceContext),
      );

      const baseError = normalizeToBaseError(err, "unexpected");

      return Err(baseError);
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
    const serviceContext: AuthLogLayerContext<"service"> =
      createAuthOperationContext({
        identifiers: { email: input.email },
        layer: "service",
        operation: "login",
      });

    const log = this.baseLog.withContext(serviceContext.loggerContext);

    try {
      const user = await this.repo.login({ email: input.email });

      if (!user) {
        log.operation("warn", "Login failed - invalid credentials", {
          details: {
            reason: "invalid_credentials_user_not_found_or_no_password",
          },
          operationIdentifiers: serviceContext.identifiers,
          operationName: serviceContext.operation,
        });

        return Err(
          makeValidationError({
            context: {
              operation: serviceContext.operation,
              reason: "invalid_credentials_user_not_found_or_no_password",
            },
            fieldErrors: {
              email: ["invalid_credentials"],
              password: ["invalid_credentials"],
            },
            formErrors: ["Invalid credentials"],
          }),
        );
      }

      if (!user.password) {
        log.operation(
          "error",
          "Login failed - missing password hash on user entity",
          {
            details: { reason: "missing_password_hash_on_user_entity" },
            operationIdentifiers: {
              ...serviceContext.identifiers,
              userId: String(user.id),
            },
            operationName: serviceContext.operation,
          },
        );

        return Err(
          makeValidationError({
            context: {
              operation: serviceContext.operation,
              reason: "missing_password_hash_on_user_entity",
              userId: String(user.id),
            },
            fieldErrors: {
              email: ["invalid_credentials"],
              password: ["invalid_credentials"],
            },
            formErrors: ["Invalid credentials"],
          }),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );

      if (!passwordOk) {
        log.operation("warn", "Login failed - invalid credentials", {
          details: { reason: "invalid_credentials_password_mismatch" },
          operationIdentifiers: serviceContext.identifiers,
          operationName: serviceContext.operation,
        });

        return Err(
          makeValidationError({
            context: {
              operation: serviceContext.operation,
              reason: "invalid_credentials_password_mismatch",
            },
            fieldErrors: {
              email: ["invalid_credentials"],
              password: ["invalid_credentials"],
            },
            formErrors: ["Invalid credentials"],
          }),
        );
      }

      log.operation("info", "Login succeeded", {
        operationIdentifiers: {
          ...serviceContext.identifiers,
          userId: String(user.id),
        },
        operationName: serviceContext.operation,
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      log.errorWithDetails(
        "Login failed",
        err,
        toLoggingContext(serviceContext),
      );

      const baseError = normalizeToBaseError(err, "unexpected");

      return Err(baseError);
    }
  }
}
