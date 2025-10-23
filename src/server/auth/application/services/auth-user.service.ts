import "server-only";
import { createRandomPassword } from "@/features/auth/lib/auth.password";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { createAuthAppError } from "@/server/auth/domain/errors/app-error.factories";
import { mapRepoErrorToAppResult } from "@/server/auth/domain/errors/app-error.mapping.repo";
import { toFormAwareError } from "@/server/auth/domain/errors/form-errors.factory";
import { toAuthUserTransport } from "@/server/auth/domain/mappers/user-transport.mapper";
import { hasRequiredSignupFields } from "@/server/auth/domain/types/auth-signup.presence-guard";
import { asPasswordHash } from "@/server/auth/domain/types/password.types";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { demoUserCounter } from "@/server/auth/infrastructure/repository/dal/demo-user-counter";
import { getAppDb } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 *
 * Depends on small ports (AuthUserRepository, PasswordHasher) for testability.
 */
export class AuthUserService {
  private readonly repo: AuthUserRepository;
  private readonly hasher: PasswordHasher;

  constructor(repo: AuthUserRepository, hasher: PasswordHasher) {
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
    try {
      const db = getAppDb();
      const counter: number = await demoUserCounter(db, role);

      if (!counter || counter <= 0) {
        serverLogger.error({
          context: "service.AuthUserService.createDemoUser",
          message: "Failed to fetch demo user counter",
          role,
        });
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

      return Ok<AuthUserTransport>(toAuthUserTransport(demoUserResult));
    } catch (err: unknown) {
      const appError = mapRepoErrorToAppResult<AuthUserTransport>(
        err,
        "service.AuthUserService.createDemoUser",
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
    if (!hasRequiredSignupFields(input)) {
      return Err(
        toFormAwareError(createAuthAppError("missing_fields"), {
          fields: ["email", "username", "password", "confirmPassword"] as const,
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

      return Ok<AuthUserTransport>(toAuthUserTransport(signupResult));
    } catch (err: unknown) {
      const appError = mapRepoErrorToAppResult<AuthUserTransport>(
        err,
        "service.UserAuthService.signup",
      );
      return appError.ok
        ? appError
        : Err(
            toFormAwareError(appError.error, {
              fields: [
                "email",
                "username",
                "password",
                "confirmPassword",
              ] as const,
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
    try {
      const user = await this.repo.login({ email: input.email });

      if (!user.password) {
        serverLogger.error(
          {
            context: "service.UserAuthService.login",
            kind: "auth-invariant",
            userId: user.id,
          },
          "Missing hashed password on user entity; cannot authenticate",
        );
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
        return Err(
          toFormAwareError(createAuthAppError("invalid_credentials"), {
            fields: ["email", "password"] as const,
          }),
        );
      }

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      const appError = mapRepoErrorToAppResult<AuthUserTransport>(
        err,
        "service.UserAuthService.login",
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
