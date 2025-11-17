// src/server/auth/application/services/auth-user.service.ts
import "server-only";
import { createRandomPassword } from "@/features/auth/lib/auth.password";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { asPasswordHash } from "@/features/auth/lib/password.types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import type { AuthUserRepositoryPort } from "@/server/auth/application/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/application/ports/password-hasher.port";
import { createAuthAppError } from "@/server/auth/domain/errors/app-error.factories";
import { mapRepoError } from "@/server/auth/domain/errors/app-error.mapping.repo";
import { toFormAwareError } from "@/server/auth/domain/errors/form-errors.factory";
import { toAuthUserTransport } from "@/server/auth/domain/mappers/user-transport.mapper";
import { hasRequiredSignupFields } from "@/server/auth/domain/types/auth-signup.presence-guard";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import { demoUserCounter } from "@/server/auth/infrastructure/repository/dal/demo-user-counter";
import {
  type AuthLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging/auth-layer-context";
import { getAppDb } from "@/server/db/db.connection";
import type { AppError } from "@/shared/errors/app-error/app-error";
import type { Logger } from "@/shared/logging/logger.shared";
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
  private readonly baseLog: Logger;

  constructor(
    repo: AuthUserRepositoryPort,
    hasher: PasswordHasherPort,
    logger: Logger,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    // Preserve the additional base context you already have
    this.baseLog = logger.withContext("auth.user.service");
  }

  /**
   * Creates a demo user with a unique username and email for the given role.
   *
   * @param role - The role assigned to the demo user.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks Uses repository transaction support and the password hasher port.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
  async createDemoUser(
    role: UserRole,
  ): Promise<Result<AuthUserTransport, AppError>> {
    // Service-layer context for this operation
    const serviceContext: AuthLayerContext<"service"> =
      createAuthOperationContext({
        identifiers: { role },
        layer: "service",
        operation: "demoUser",
      });

    const log = this.baseLog.withContext(serviceContext.context);

    try {
      const db = getAppDb();
      const counter = await demoUserCounter(db, role);

      if (!counter || counter <= 0) {
        log.error("Invalid demo user counter", {
          counter,
          identifiers: serviceContext.identifiers,
          operation: serviceContext.operation,
          reason: "invalid_demo_user_counter",
          role,
        });
        return Err(
          createAuthAppError("unexpected", {
            counter,
            operation: serviceContext.operation,
            reason: "invalid_demo_user_counter",
            role,
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

      log.info("Demo user created", {
        email: uniqueEmail,
        identifiers: serviceContext.identifiers,
        operation: serviceContext.operation,
        role,
        username: uniqueUsername,
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      log.error("Failed to create demo user", {
        error: err,
        identifiers: serviceContext.identifiers,
        operation: serviceContext.operation,
      });

      const appError = mapRepoError(err, serviceContext.context);

      return Err(
        toFormAwareError(appError, {
          fields: ["email", "username", "password"] as const,
        }),
      );
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
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const serviceContext: AuthLayerContext<"service"> =
      createAuthOperationContext({
        identifiers: {
          email: input.email,
          username: input.username,
        },
        layer: "service",
        operation: "signup",
      });

    const log = this.baseLog.withContext(serviceContext.context);

    if (!hasRequiredSignupFields(input)) {
      log.warn("Missing required signup fields", {
        email: input.email,
        identifiers: serviceContext.identifiers,
        operation: serviceContext.operation,
        username: input.username,
      });

      return Err(
        toFormAwareError(createAuthAppError("missing_fields"), {
          fields: ["email", "username", "password"] as const,
        }),
      );
    }

    try {
      const passwordHash = await this.hasher.hash(input.password);

      // All DB errors are already converted to domain/infra errors in insertUserDal.
      const userRow = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: input.email,
          password: passwordHash,
          role: toUserRole("USER"),
          username: input.username,
        }),
      );

      log.info("Signup succeeded", {
        email: input.email,
        identifiers: serviceContext.identifiers,
        operation: serviceContext.operation,
        username: input.username,
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(userRow));
    } catch (err: unknown) {
      // Only domain/AppError types must be caught here (e.g. Conflict, Validation).
      log.errorWithDetails("Signup failed", err, {
        identifiers: serviceContext.identifiers,
        operation: serviceContext.operation,
      });

      const appError = mapRepoError(err, serviceContext.context);

      return Err(
        toFormAwareError(appError, {
          fields: ["email", "username", "password"] as const,
        }),
      );
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
   * - All infra/repo errors are mapped via `mapRepoError` into AppError.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: login flow is inherently multi-step
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const serviceContext: AuthLayerContext<"service"> =
      createAuthOperationContext({
        identifiers: { email: input.email },
        layer: "service",
        operation: "login",
      });

    const log = this.baseLog.withContext(serviceContext.context);

    try {
      const user = await this.repo.login({ email: input.email });

      // Repo: null → user not found or no password
      if (!user) {
        log.warn("Login failed - invalid credentials", {
          identifiers: serviceContext.identifiers,
          operation: serviceContext.operation,
          reason: "invalid_credentials_user_not_found_or_no_password",
        });

        return Err(
          toFormAwareError(
            createAuthAppError("invalid_credentials", {
              operation: serviceContext.operation,
              reason: "invalid_credentials_user_not_found_or_no_password",
            }),
            {
              fields: ["email", "password"] as const,
            },
          ),
        );
      }

      if (!user.password) {
        // Defensive: should not normally happen since repo treats "no password" as null
        log.error("Login failed - missing password hash on user entity", {
          identifiers: {
            ...serviceContext.identifiers,
            userId: String(user.id),
          },
          operation: serviceContext.operation,
          reason: "missing_password_hash_on_user_entity",
        });

        return Err(
          toFormAwareError(
            createAuthAppError("invalid_credentials", {
              operation: serviceContext.operation,
              reason: "missing_password_hash_on_user_entity",
              userId: String(user.id),
            }),
            {
              fields: ["email", "password"] as const,
            },
          ),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );

      if (!passwordOk) {
        log.warn("Login failed - invalid credentials", {
          identifiers: serviceContext.identifiers,
          operation: serviceContext.operation,
          reason: "invalid_credentials_password_mismatch",
        });

        return Err(
          toFormAwareError(
            createAuthAppError("invalid_credentials", {
              operation: serviceContext.operation,
              reason: "invalid_credentials_password_mismatch",
            }),
            {
              fields: ["email", "password"] as const,
            },
          ),
        );
      }

      log.info("Login succeeded", {
        identifiers: {
          ...serviceContext.identifiers,
          userId: String(user.id),
        },
        operation: serviceContext.operation,
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      // Any repo/infra/domain throw is normalized here into AppError
      log.error("Login failed", {
        error: err,
        identifiers: serviceContext.identifiers,
        operation: serviceContext.operation,
      });

      const appError = mapRepoError(err, serviceContext.context);

      return Err(
        toFormAwareError(appError, {
          fields: ["email", "password"] as const,
        }),
      );
    }
  }
}
