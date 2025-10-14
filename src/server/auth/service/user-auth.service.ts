import "server-only";
import type { LoginData, SignupData } from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { comparePassword, hashPassword } from "@/server/auth/crypto/hashing";
import { AuthUserRepo } from "@/server/auth/repo/user-auth.repository";
import {
  type AuthServiceError,
  mapRepoErrorToAuthResult,
  toError,
} from "@/server/auth/service/auth-errors";
import { asPasswordHash } from "@/server/auth/types/password.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { userEntityToDto } from "@/server/users/mapping/user.mappers";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 */
export class UserAuthFlowService {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /**
   * Signup: hashes password, delegates to repo, returns Result<UserDto, AuthServiceError>.
   * Always atomic via repo.withTransaction.
   */
  async signup(
    input: Readonly<SignupData>,
  ): Promise<Result<UserDto, AuthServiceError>> {
    if (!input?.email || !input?.password || !input?.username) {
      return Err(toError("missing_fields"));
    }

    const email = input.email.trim().toLowerCase();
    const username = input.username.trim();
    const repo = new AuthUserRepo(this.db);

    try {
      const hashed = await hashPassword(input.password);
      const passwordHash = asPasswordHash(hashed);

      const entity = await repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email,
          passwordHash,
          role: toUserRole("USER"),
          username,
        }),
      );
      return Ok(userEntityToDto(entity));
    } catch (err: unknown) {
      return mapRepoErrorToAuthResult<UserDto>(
        err,
        "service.UserAuthFlowService.signup",
      );
    }
  }

  /**
   * Login: fetch user, compare password, return Result.
   */
  async login(
    input: Readonly<LoginData>,
  ): Promise<Result<UserDto, AuthServiceError>> {
    const repo = new AuthUserRepo(this.db);

    try {
      const user = await repo.login({ email: input.email });

      // Defensive: always check the existence/type of password
      if (!user.password || typeof user.password !== "string") {
        serverLogger.error(
          {
            context: "service.UserAuthFlowService.login",
            kind: "auth-invariant",
            userId: user.id,
          },
          "Missing hashed password on user entity; cannot authenticate",
        );
        return Err(toError("invalid_credentials"));
      }

      const passwordOk = await comparePassword(input.password, user.password);
      if (!passwordOk) {
        return Err(toError("invalid_credentials"));
      }

      return Ok(userEntityToDto(user));
    } catch (err: unknown) {
      return mapRepoErrorToAuthResult<UserDto>(
        err,
        "service.UserAuthFlowService.login",
      );
    }
  }
}
