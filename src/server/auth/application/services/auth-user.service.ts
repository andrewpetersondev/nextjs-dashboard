import "server-only";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { createAuthServiceAppError } from "@/server/auth/domain/errors/auth-error.factories";
import { mapRepoErrorToAuthResult } from "@/server/auth/domain/errors/auth-error.mapping.repo";
import { toAuthUserTransport } from "@/server/auth/domain/mappers/user-transport.mapper";
import { hasRequiredSignupFields } from "@/server/auth/domain/types/auth-signup.presence-guard";
import { asPasswordHash } from "@/server/auth/domain/types/password.types";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
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
   * Signup: hashes password, delegates to repo, returns Result<AuthUserTransport, AuthServiceError>.
   * Always atomic via repo.withTransaction.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<AuthUserTransport, AppError>> {
    if (!hasRequiredSignupFields(input)) {
      return Err(createAuthServiceAppError("missing_fields"));
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
      return mapRepoErrorToAuthResult<AuthUserTransport>(
        err,
        "service.UserAuthService.signup",
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
        return Err(createAuthServiceAppError("invalid_credentials"));
      }

      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );
      if (!passwordOk) {
        return Err(createAuthServiceAppError("invalid_credentials"));
      }

      return Ok<AuthUserTransport>(toAuthUserTransport(user));
    } catch (err: unknown) {
      return mapRepoErrorToAuthResult<AuthUserTransport>(
        err,
        "service.UserAuthService.login",
      );
    }
  }
}
