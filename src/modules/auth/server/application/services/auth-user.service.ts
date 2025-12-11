import "server-only";
import { hasRequiredSignupFields } from "@/modules/auth/domain/auth.guards";
import { toAuthUserTransport } from "@/modules/auth/domain/auth.mappers";
import type { AuthUserTransport } from "@/modules/auth/domain/auth.types";
import { isValidDemoUserCounter } from "@/modules/auth/domain/demo-user/demo-user.guards";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import { createRandomPassword } from "@/modules/auth/domain/password/password-generator"; // Keep this if still needed; otherwise, consider moving to shared if reusable
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type {
  LoginData,
  SignupData,
} from "@/modules/auth/domain/schema/auth.schema";
import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import { asHash } from "@/server/crypto/hashing/hashing.types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { normalizeToAppError } from "@/shared/errors/normalizers/app-error.normalizer";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * AuthUserService orchestrates authentication and user creation logic.
 *
 * @remarks
 * - Returns discriminated Result objects instead of throwing.
 * - Depends on small ports (AuthUserRepositoryPort, HashingService) for testability.
 * - Accepts optional requestId for tracing across layers.
 */
export class AuthUserService {
  private readonly repo: AuthUserRepositoryPort;
  private readonly hasher: HashingService;
  private readonly requestId?: string;

  constructor(
    repo: AuthUserRepositoryPort,
    hasher: HashingService,
    requestId?: string,
  ) {
    this.repo = repo;
    this.hasher = hasher;
    this.requestId = requestId;
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
    try {
      const counter = await this.repo.incrementDemoUserCounter(role);

      if (!isValidDemoUserCounter(counter)) {
        const error = normalizeToAppError(
          new Error("invalid_counter"),
          "validation",
        );
        logAuth(
          "error",
          "Invalid demo user counter",
          AuthLog.service.demoUser.error(error, { role }),
          { additionalData: { counter }, requestId: this.requestId },
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
          requestId: this.requestId,
        },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      const error = normalizeToAppError(err, "unexpected");
      logAuth(
        "error",
        "Demo user creation failed",
        AuthLog.service.demoUser.error(error, { role }),
        { requestId: this.requestId },
      );
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
        { requestId: this.requestId },
      );
      return Err(error);
    }

    try {
      const passwordHash = await this.hasher.hash(input.password);
      const demoUser = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: input.email,
          password: passwordHash,
          role: parseUserRole("USER"),
          username: input.username,
        }),
      );

      logAuth(
        "info",
        "Signup service success",
        AuthLog.service.signup.success({ email: input.email }),
        { requestId: this.requestId },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUser));
    } catch (err: unknown) {
      const error = normalizeToAppError(err, "unexpected");
      logAuth(
        "error",
        "Signup service failed",
        AuthLog.service.signup.error(error, { email: input.email }),
        { requestId: this.requestId },
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
   * - Login is read-only; no transaction needed.
   * - All infra/repo errors are mapped via `normalizeToAppError` into AppError.
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: login flow is inherently multi-step
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
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
          { requestId: this.requestId },
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
          { requestId: this.requestId },
        );
        return Err(error);
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asHash(user.password),
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
          { requestId: this.requestId },
        );
        return Err(error);
      }

      logAuth(
        "info",
        "Login succeeded",
        AuthLog.service.login.success({ email: input.email }),
        {
          additionalData: { userId: String(user.id) },
          requestId: this.requestId,
        },
      );

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      const error = normalizeToAppError(err, "unexpected");
      logAuth(
        "error",
        "Login service unexpected error",
        AuthLog.service.login.error(error, { email: input.email }),
        { requestId: this.requestId },
      );
      return Err(error);
    }
  }
}
