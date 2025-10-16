import "server-only";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import {
  type AuthServiceError,
  createAuthServiceError,
  mapRepoErrorToAuthServiceResult,
} from "@/server/auth/domain/errors/auth-service.error";
import { normalizeSignupInput } from "@/server/auth/domain/types/auth-signup.normalization";
import { hasRequiredSignupFields } from "@/server/auth/domain/types/auth-signup.presence-guard";
import { asPasswordHash } from "@/server/auth/domain/types/password.types";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";
import { toUserId } from "@/shared/domain/id-converters";

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
  ): Promise<Result<AuthUserTransport, AuthServiceError>> {
    if (!hasRequiredSignupFields(input)) {
      return Err(createAuthServiceError("missing_fields"));
    }

    const normalized = normalizeSignupInput(input);

    try {
      // Centralized hashing via PasswordHasher
      const passwordHash = await this.hasher.hash(normalized.password);

      const entity = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: normalized.email,
          password: passwordHash,
          role: toUserRole("USER"),
          username: normalized.username,
        }),
      );
      // entity is a repo return, not a full UserEntity; build transport type directly
      return Ok<AuthUserTransport>({
        email: String(entity.email),
        id: toUserId(String(entity.id)),
        role: toUserRole(String(entity.role)),
        username: String(entity.username),
      });
    } catch (err: unknown) {
      return mapRepoErrorToAuthServiceResult<AuthUserTransport>(
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
  ): Promise<Result<AuthUserTransport, AuthServiceError>> {
    try {
      const user = await this.repo.login({
        email: String(input.email).trim().toLowerCase(),
      });

      // Defensive: ensure a non-empty hashed password exists
      if (!user.password) {
        serverLogger.error(
          {
            context: "service.UserAuthService.login",
            kind: "auth-invariant",
            userId: user.id,
          },
          "Missing hashed password on user entity; cannot authenticate",
        );
        return Err(createAuthServiceError("invalid_credentials"));
      }

      // Centralized comparison via PasswordHasher
      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );
      if (!passwordOk) {
        return Err(createAuthServiceError("invalid_credentials"));
      }

      // Build transport type directly to avoid requiring UI DTO
      return Ok<AuthUserTransport>({
        email: String(user.email),
        id: toUserId(String(user.id)),
        role: toUserRole(String(user.role)),
        username: String(user.username),
      });
    } catch (err: unknown) {
      return mapRepoErrorToAuthServiceResult<AuthUserTransport>(
        err,
        "service.UserAuthService.login",
      );
    }
  }
}
