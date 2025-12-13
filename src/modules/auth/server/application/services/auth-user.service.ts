import "server-only";

import { hasRequiredSignupFields } from "@/modules/auth/domain/auth.guards";
import { toAuthUserTransport } from "@/modules/auth/domain/auth.mappers";
import type { AuthUserTransport } from "@/modules/auth/domain/auth.types";
import type { UserRole } from "@/modules/auth/domain/schema/auth.roles";
import type {
  LoginData,
  SignupData,
} from "@/modules/auth/domain/schema/auth.schema";
import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { asHash } from "@/server/crypto/hashing/hashing.types";
import { createRandomPassword } from "@/shared/crypto/password-generator";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { makeAppErrorFromUnknown } from "@/shared/errors/factories/app-error.factory";
import { isPositiveNumber } from "@/shared/guards/number.guards";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * AuthUserService orchestrates authentication and user creation logic.
 *
 * @remarks
 * - Returns discriminated Result objects instead of throwing.
 * - Depends on small ports (AuthUserRepositoryPort, HashingService) for testability.
 */
export class AuthUserService {
  private readonly hasher: HashingService;
  private readonly logger: LoggingClientContract;
  private readonly repo: AuthUserRepositoryPort;

  constructor(
    repo: AuthUserRepositoryPort,
    hasher: HashingService,
    logger: LoggingClientContract,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.logger = logger.withContext("auth:service");
  }

  /**
   * Creates a demo user with a unique username and email for the given role.
   *
   * @param role - The role assigned to the demo user.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks
   * - Demo users receive randomly generated passwords for security.
   * - Password length: 16 characters (alphanumeric + symbols).
   * - Counter ensures unique email/username per role.
   * - Transaction ensures user + counter increment are atomic.
   */
  async createDemoUser(
    role: UserRole,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const logger = this.logger.child({ role });

    logger.operation("info", "Create demo user service started", {
      operationName: "demoUser.start",
    });

    try {
      const counter = await this.repo.incrementDemoUserCounter(role);

      if (!isPositiveNumber(counter)) {
        const error = makeAppErrorFromUnknown(
          new Error("invalid_counter"),
          "validation",
        );

        logger.operation("error", "Invalid demo user counter", {
          error,
          operationIdentifiers: { counter, role },
          operationName: "demoUser.counter.invalid",
        });

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

      logger.operation("info", "Demo user created", {
        operationIdentifiers: {
          email: uniqueEmail,
          role,
          username: uniqueUsername,
        },
        operationName: "demoUser.success",
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      const error = makeAppErrorFromUnknown(err, "unexpected");

      logger.operation("error", "Demo user creation failed", {
        error,
        operationName: "demoUser.error",
      });

      return Err(error);
    }
  }

  /**
   * Service method for handling user signup flow.
   *
   * @param input - Readonly SignupData containing email, username and password.
   * @returns A discriminated Result containing AuthUserTransport on success or AppError on failure.
   *
   * @remarks
   * - Password is hashed before storage.
   * - All users are assigned the USER role.
   * - Transaction ensures atomic user creation.
   * - Only handles domain/infra errors from repository layer.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const logger = this.logger.child({ email: input.email });

    if (!hasRequiredSignupFields(input)) {
      const error = makeAppErrorFromUnknown(
        new Error("missing_fields"),
        "missingFields",
      );

      logger.operation("warn", "Missing required signup fields", {
        error,
        operationIdentifiers: { email: input.email, username: input.username },
        operationName: "signup.validation.missingFields",
      });

      return Err(error);
    }

    logger.operation("info", "Signup service started", {
      operationIdentifiers: { email: input.email, username: input.username },
      operationName: "signup.start",
    });

    try {
      const passwordHash = await this.hasher.hash(input.password);

      const createdUser = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: input.email,
          password: passwordHash,
          role: parseUserRole("USER"),
          username: input.username,
        }),
      );

      logger.operation("info", "Signup service success", {
        operationIdentifiers: {
          email: input.email,
          userId: String(createdUser.id),
        },
        operationName: "signup.success",
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(createdUser));
    } catch (err: unknown) {
      const error = makeAppErrorFromUnknown(err, "unexpected");

      logger.operation("error", "Signup service failed", {
        error,
        operationIdentifiers: { email: input.email },
        operationName: "signup.error",
      });

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
   * - Login is read-only; no transaction needed.
   * - All infra/repo errors are mapped via `normalizeToAppError` into AppError.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: login flow is inherently multi-step
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const logger = this.logger.child({ email: input.email });

    try {
      logger.operation("info", "Login service started", {
        operationIdentifiers: { email: input.email },
        operationName: "login.start",
      });

      const user = await this.repo.login({ email: input.email });

      if (!user) {
        const error = makeAppErrorFromUnknown(
          new Error("user_not_found"),
          "notFound",
        );

        logger.operation("warn", "Login failed - user not found", {
          error,
          operationIdentifiers: { email: input.email },
          operationName: "login.user.notFound",
        });

        return Err(error);
      }

      if (!user.password) {
        const error = makeAppErrorFromUnknown(
          new Error("missing_password_hash"),
          "validation",
        );

        logger.operation("error", "Login failed - missing password hash", {
          error,
          operationIdentifiers: { email: input.email, userId: String(user.id) },
          operationName: "login.user.missingPasswordHash",
        });

        return Err(error);
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asHash(user.password),
      );

      if (!passwordOk) {
        const error = makeAppErrorFromUnknown(
          new Error("invalid_password"),
          "invalidCredentials",
        );

        logger.operation("warn", "Login failed - invalid password", {
          error,
          operationIdentifiers: { email: input.email },
          operationName: "login.password.invalid",
        });

        return Err(error);
      }

      logger.operation("info", "Login succeeded", {
        operationIdentifiers: { email: input.email, userId: String(user.id) },
        operationName: "login.success",
      });

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      const error = makeAppErrorFromUnknown(err, "unexpected");

      logger.operation("error", "Login service unexpected error", {
        error,
        operationIdentifiers: { email: input.email },
        operationName: "login.unexpectedError",
      });

      return Err(error);
    }
  }
}
