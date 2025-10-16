import "server-only";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import {
  type AuthServiceError,
  mapRepoErrorToAuthResult,
  toError,
} from "@/server/auth/domain/errors/auth-errors";
import {
  hasRequiredSignupFields,
  normalizeSignupInput,
} from "@/server/auth/domain/types/auth-signup.helpers";
import { asPasswordHash } from "@/server/auth/domain/types/password.types";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/user-auth.repository.port";
import { serverLogger } from "@/server/logging/serverLogger";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 *
 * Depends on small ports (AuthUserRepository, PasswordHasher) for testability.
 */
export class UserAuthService {
  private readonly repo: AuthUserRepository;
  private readonly hasher: PasswordHasher;

  constructor(repo: AuthUserRepository, hasher: PasswordHasher) {
    this.repo = repo;
    this.hasher = hasher;
  }

  /**
   * Signup: hashes password, delegates to repo, returns Result<UserDto, AuthServiceError>.
   * Always atomic via repo.withTransaction.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<UserDto, AuthServiceError>> {
    if (!hasRequiredSignupFields(input)) {
      return Err(toError("missing_fields"));
    }

    const normalized = normalizeSignupInput(input);

    try {
      // Centralized hashing via PasswordHasher
      const passwordHash = await this.hasher.hash(normalized.password);

      const entity = await this.repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: normalized.email,
          passwordHash,
          role: toUserRole("USER"),
          username: normalized.username,
        }),
      );
      // entity is a repo return, not a full UserEntity; build DTO directly
      return Ok<UserDto>({
        email: String(entity.email),
        id: String(entity.id),
        role: toUserRole(String(entity.role)) as UserDto["role"],
        username: String(entity.username),
      });
    } catch (err: unknown) {
      return mapRepoErrorToAuthResult<UserDto>(
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
  ): Promise<Result<UserDto, AuthServiceError>> {
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
        return Err(toError("invalid_credentials"));
      }

      // Centralized comparison via PasswordHasher
      const passwordOk = await this.hasher.compare(
        input.password,
        asPasswordHash(user.password),
      );
      if (!passwordOk) {
        return Err(toError("invalid_credentials"));
      }

      // Build DTO directly to avoid requiring full UserEntity
      return Ok<UserDto>({
        email: String(user.email),
        id: String(user.id),
        role: toUserRole(String(user.role)) as UserDto["role"],
        username: String(user.username),
      });
    } catch (err: unknown) {
      return mapRepoErrorToAuthResult<UserDto>(
        err,
        "service.UserAuthService.login",
      );
    }
  }
}
