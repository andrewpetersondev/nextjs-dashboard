import "server-only";
import type {
  LoginData,
  SignupData,
  SignupField,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { comparePassword, hashPassword } from "@/server/auth/crypto/hashing";
import { AuthUserRepo } from "@/server/auth/repo/user-auth.repository";
import { asPasswordHash } from "@/server/auth/types/password.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { userEntityToDto } from "@/server/users/mapping/user.mappers";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

// --- Constants ---
const DEFAULT_MISSING_FIELDS: readonly SignupField[] = [
  "email",
  "password",
  "username",
] as const;

const AUTH_CONFLICT_TARGETS = ["email", "username"] as const;

// Centralized messages/targets for cohesion.
const AUTH_MESSAGES = {
  conflict: "Email or username already in use",
  invalidCreds: "Invalid email or password",
  missing: "Missing required fields",
  unexpected: "Unexpected error occurred",
  validation: "Invalid data",
} as const;

function toError<K extends AuthServiceError["kind"]>(
  kind: K,
  init?: Partial<Extract<AuthServiceError, { kind: K }>>,
): AuthServiceError {
  switch (kind) {
    case "missing_fields":
      return {
        fields: DEFAULT_MISSING_FIELDS,
        kind,
        message: AUTH_MESSAGES.missing,
        ...init,
      } as const;
    case "conflict":
      return {
        kind,
        message: AUTH_MESSAGES.conflict,
        targets: AUTH_CONFLICT_TARGETS,
        ...init,
      } as const;
    case "invalid_credentials":
      return { kind, message: AUTH_MESSAGES.invalidCreds, ...init } as const;
    case "validation":
      return { kind, message: AUTH_MESSAGES.validation, ...init } as const;
    case "unexpected":
      return {
        kind: "unexpected",
        message: AUTH_MESSAGES.unexpected,
        ...init,
      } as const;
    default:
      return { kind: "unexpected", message: AUTH_MESSAGES.unexpected } as const;
  }
}

// Map repository/domain errors into AuthServiceError Results.
function mapRepoErrorToAuthResult<T>(
  err: unknown,
  context: string,
): Result<T, AuthServiceError> {
  if (err instanceof ConflictError) {
    return Err(toError("conflict"));
  }
  if (err instanceof UnauthorizedError) {
    return Err(toError("invalid_credentials"));
  }
  if (err instanceof ValidationError) {
    return Err(toError("validation"));
  }
  serverLogger.error({ context, kind: "unexpected" }, "Unexpected auth error");
  return Err(toError("unexpected"));
}

export type AuthServiceError =
  | {
      readonly kind: "missing_fields";
      readonly message: string;
      readonly fields: readonly SignupField[];
    }
  | {
      readonly kind: "conflict";
      readonly message: string;
      readonly targets: ReadonlyArray<"email" | "username">;
    }
  | { readonly kind: "invalid_credentials"; readonly message: string }
  | { readonly kind: "validation"; readonly message: string }
  | { readonly kind: "unexpected"; readonly message: string };

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
