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

// --- Pure helpers (extractable/standalone) ---
function normalizeSignupInput(input: Readonly<SignupData>): {
  email: string;
  username: string;
  password: string;
} {
  return {
    email: String(input.email).trim().toLowerCase(),
    password: String(input.password),
    username: String(input.username).trim(),
  };
}

function hasRequiredSignupFields(
  input: Partial<SignupData> | null | undefined,
): boolean {
  return Boolean(
    input &&
      typeof input.email === "string" &&
      input.email.length > 0 &&
      typeof input.password === "string" &&
      input.password.length > 0 &&
      typeof input.username === "string" &&
      input.username.length > 0,
  );
}

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
    if (!hasRequiredSignupFields(input)) {
      return Err(toError("missing_fields"));
    }

    const normalized = normalizeSignupInput(input);
    const repo = new AuthUserRepo(this.db);

    try {
      const hashed = await hashPassword(normalized.password);
      const passwordHash = asPasswordHash(hashed);

      const entity = await repo.withTransaction(async (txRepo) =>
        txRepo.signup({
          email: normalized.email,
          passwordHash,
          role: toUserRole("USER"),
          username: normalized.username,
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
      const user = await repo.login({
        email: String(input.email).trim().toLowerCase(),
      });

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
