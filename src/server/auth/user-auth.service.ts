import "server-only";
import type {
  LoginData,
  SignupData,
  SignupField,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { comparePassword, hashPassword } from "@/server/auth/hashing";
import { asPasswordHash } from "@/server/auth/types/password.types";
import { AuthUserRepo } from "@/server/auth/user-auth.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { userEntityToDto } from "@/server/users/mapping/user.mappers";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain-error";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

// --- Constants ---
const DEFAULT_MISSING_FIELDS: readonly SignupField[] = [
  "email",
  "password",
  "username",
] as const;
const CONFLICT_TARGETS = ["email", "username"] as const;
const MSG_MISSING = "Missing required fields";
const MSG_CONFLICT = "Email or username already in use";
const MSG_INVALID_CREDS = "Invalid email or password";
const MSG_VALIDATION = "Invalid data";
const MSG_UNEXPECTED = "Unexpected error occurred";

/**
 * Build an AuthServiceError for missing signup fields.
 */
function toMissingSignupFieldsError(): AuthServiceError {
  return {
    fields: DEFAULT_MISSING_FIELDS,
    kind: "missing_fields",
    message: MSG_MISSING,
  };
}

/**
 * Build an AuthServiceError for signup conflicts (e.g., email/username already exists).
 */
function toConflictError(): AuthServiceError {
  return {
    kind: "conflict",
    message: MSG_CONFLICT,
    targets: CONFLICT_TARGETS,
  };
}

/**
 * Build an AuthServiceError for invalid credentials.
 */
function toInvalidCredentialsError(): AuthServiceError {
  return {
    kind: "invalid_credentials",
    message: MSG_INVALID_CREDS,
  };
}

/**
 * Build an AuthServiceError for a validation failure.
 */
function toValidationError(message: string = MSG_VALIDATION): AuthServiceError {
  return {
    kind: "validation",
    message,
  };
}

/**
 * Build an AuthServiceError for any unexpected error.
 */
function toUnexpectedError(message: string = MSG_UNEXPECTED): AuthServiceError {
  return {
    kind: "unexpected",
    message,
  };
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
  async signup(input: SignupData): Promise<Result<UserDto, AuthServiceError>> {
    // Early missing field guard
    if (!input?.email || !input?.password || !input?.username) {
      return Err(toMissingSignupFieldsError());
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
      if (err instanceof ConflictError) {
        return Err(toConflictError());
      }
      if (err instanceof ValidationError) {
        return Err(toValidationError());
      }
      serverLogger.error(
        {
          context: "service.UserAuthFlowService.signup",
          err,
          kind: "unexpected",
        },
        "Unexpected error during signup",
      );
      return Err(toUnexpectedError());
    }
  }

  /**
   * Login: fetch user, compare password, return Result.
   */
  async login(input: LoginData): Promise<Result<UserDto, AuthServiceError>> {
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
        throw new UnauthorizedError(MSG_INVALID_CREDS);
      }

      const passwordOk = await comparePassword(input.password, user.password);
      if (!passwordOk) {
        throw new UnauthorizedError(MSG_INVALID_CREDS);
      }

      return Ok(userEntityToDto(user));
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) {
        return Err(toInvalidCredentialsError());
      }
      if (err instanceof ValidationError) {
        return Err(toValidationError());
      }
      serverLogger.error(
        {
          context: "service.UserAuthFlowService.login",
          err,
          kind: "unexpected",
        },
        "Unexpected error during login",
      );
      return Err(toUnexpectedError());
    }
  }
}
