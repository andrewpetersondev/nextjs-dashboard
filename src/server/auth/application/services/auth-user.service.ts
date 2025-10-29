import "server-only";
import { createRandomPassword } from "@/features/auth/lib/auth.password";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { asPasswordHash } from "@/features/auth/lib/password.types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { createAuthAppError } from "@/server/auth/domain/errors/app-error.factories";
import { mapRepoErrorToAppResult } from "@/server/auth/domain/errors/app-error.mapping.repo";
import { AUTH_SERVICE_CONTEXTS } from "@/server/auth/domain/errors/auth-error.logging";
import { toFormAwareError } from "@/server/auth/domain/errors/form-errors.factory";
import { toAuthUserTransport } from "@/server/auth/domain/mappers/user-transport.mapper";
import { hasRequiredSignupFields } from "@/server/auth/domain/types/auth-signup.presence-guard";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import type { AuthUserRepositoryPort } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { demoUserCounter } from "@/server/auth/infrastructure/repository/dal/demo-user-counter";
import { getAppDb } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 *
 * Depends on small ports (AuthUserRepositoryPort, PasswordHasherPort) for testability.
 */
export class AuthUserService {
  private readonly repo: AuthUserRepositoryPort;
  private readonly hasher: PasswordHasherPort;

  constructor(repo: AuthUserRepositoryPort, hasher: PasswordHasherPort) {
    this.repo = repo;
    this.hasher = hasher;
  }

  /**
   * Creates a demo user with a unique username and email for the given role.
   * Returns Result<AuthUserTransport, AppError> for consistent error handling.
   */
  async createDemoUser(
    role: UserRole,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const ctx = AUTH_SERVICE_CONTEXTS.createDemoUser;

    try {
      const db = getAppDb();
      const counter = await demoUserCounter(db, role);

      if (!counter || counter <= 0) {
        console.error("Failed to create demo user counter");
        return Err(createAuthAppError("unexpected"));
      }

      const demoPassword = createRandomPassword();
      const uniqueEmail = `demo+${role}${counter}@demo.com`;
      const uniqueUsername = `Demo_${role.toUpperCase()}_${counter}`;

      const passwordHash = await this.hasher.hash(demoPassword);

      const demoUserResult = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: uniqueEmail,
          password: passwordHash,
          role,
          username: uniqueUsername,
        }),
      );

      console.info("Demo user created successfully.");

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUserResult));
    } catch (err: unknown) {
      console.error("Failed to create demo user counter", err);

      const appError = mapRepoErrorToAppResult<AuthUserTransport>(
        err,
        ctx.context,
      );
      return appError.ok
        ? appError
        : Err(
            toFormAwareError(appError.error, {
              fields: ["email", "username", "password"] as const,
            }),
          );
    }
  }

  /**
   * Signup: hashes password, delegates to repo, returns Result<AuthUserTransport, AppError>.
   * Always atomic via repo.withTransaction.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const ctx = AUTH_SERVICE_CONTEXTS.signup;

    if (!hasRequiredSignupFields(input)) {
      console.error("missing required fields");

      return Err(
        toFormAwareError(createAuthAppError("missing_fields"), {
          fields: ["email", "username", "password"] as const,
        }),
      );
    }

    try {
      const passwordHash = await this.hasher.hash(input.password);

      const signupResult = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: input.email,
          password: passwordHash,
          role: toUserRole("USER"),
          username: input.username,
        }),
      );

      console.info("Signup successfully.");

      return Ok<AuthUserTransport>(toAuthUserTransport(signupResult));
    } catch (err: unknown) {
      console.error("Failed to create demo user counter", err);

      const appError = mapRepoErrorToAppResult<AuthUserTransport>(
        err,
        ctx.context,
      );
      return appError.ok
        ? appError
        : Err(
            toFormAwareError(appError.error, {
              fields: ["email", "username", "password"] as const,
            }),
          );
    }
  }

  /**
   * Login: fetch user, compare password, return Result.
   */
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    const ctx = AUTH_SERVICE_CONTEXTS.login;

    try {
      const user = await this.repo.login({ email: input.email });

      if (!user.password) {
        console.error("Failed to login");

        return Err(
          toFormAwareError(createAuthAppError("invalid_credentials"), {
            fields: ["email", "password"] as const,
          }),
        );
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );

      if (!passwordOk) {
        console.error("Failed to compare");
        return Err(
          toFormAwareError(createAuthAppError("invalid_credentials"), {
            fields: ["email", "password"] as const,
          }),
        );
      }

      console.info("Login successfully.");

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      console.error("Failed to login");
      const appError = mapRepoErrorToAppResult<AuthUserTransport>(
        err,
        ctx.context,
      );
      return appError.ok
        ? appError
        : Err(
            toFormAwareError(appError.error, {
              fields: ["email", "password"] as const,
            }),
          );
    }
  }
}
