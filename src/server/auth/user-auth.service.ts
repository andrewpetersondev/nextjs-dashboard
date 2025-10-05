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

/**
 * Domain-level auth error returned by the service.
 * Action/controller maps this to UI shapes (e.g., DenseFieldErrorMap).
 */
export type AuthServiceError =
  | {
      kind: "missing_fields";
      fields: readonly SignupField[];
      message: string;
    }
  | {
      kind: "conflict";
      targets: ReadonlyArray<"email" | "username">;
      message: string;
    }
  | {
      kind: "invalid_credentials";
      message: string;
    }
  | {
      kind: "validation";
      message: string;
    }
  | {
      kind: "unexpected";
      message: string;
    };

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 */
export class UserAuthFlowService {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  // Internal helpers now build domain errors (ErrorLike), not UI field maps
  private missingSignupFieldsError(): AuthServiceError {
    return {
      fields: ["email", "password", "username"],
      kind: "missing_fields",
      message: "Missing required fields",
    };
  }

  private unexpectedError(
    message = "Unexpected error occurred",
  ): AuthServiceError {
    return { kind: "unexpected", message };
  }

  private conflictError(): AuthServiceError {
    return {
      kind: "conflict",
      message: "Email or username already in use",
      targets: ["email", "username"],
    };
  }

  private validationError(message = "Invalid data"): AuthServiceError {
    return { kind: "validation", message };
  }

  private invalidCredentialsError(): AuthServiceError {
    return {
      kind: "invalid_credentials",
      message: "Invalid email or password",
    };
  }

  /**
   * Signup: hashes password, delegates to repo, returns Result<UserDto, AuthServiceError>.
   * Orchestration and cross-entity invariants (if any) remain here; uses repo.withTransaction when atomicity is required.
   */
  async signup(input: SignupData): Promise<Result<UserDto, AuthServiceError>> {
    if (!input?.email || !input?.password || !input?.username) {
      return Err(this.missingSignupFieldsError());
    }

    const repo = new AuthUserRepo(this.db);

    try {
      const email = input.email.trim().toLowerCase();
      const username = input.username.trim();

      const hashed = await hashPassword(input.password as unknown as string);
      const passwordHash = asPasswordHash(hashed);

      const created = await repo.withTransaction(async (tx) => {
        return await tx.signup({
          email,
          passwordHash,
          role: toUserRole("USER"),
          username,
        });
      });

      const dto = userEntityToDto(created);
      return Ok(dto);
    } catch (err: unknown) {
      if (err instanceof ConflictError) {
        return Err(this.conflictError());
      }
      if (err instanceof ValidationError) {
        return Err(this.validationError());
      }
      serverLogger.error(
        {
          context: "service.UserAuthFlowService.signup",
          err,
          kind: "unexpected",
        },
        "Unexpected error during signup",
      );
      return Err(this.unexpectedError());
    }
  }

  /**
   * Login: fetch user by email, compare raw vs stored hash in Service.
   */
  async login(input: LoginData): Promise<Result<UserDto, AuthServiceError>> {
    const repo = new AuthUserRepo(this.db);

    try {
      const user = await repo.login({ email: input.email });

      if (!user.password || typeof user.password !== "string") {
        serverLogger.error(
          { context: "service.UserAuthFlowService.login" },
          "Missing hashed password on user entity; cannot authenticate",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }

      const ok = await comparePassword(
        input.password as unknown as string,
        user.password as unknown as string,
      );
      if (!ok) {
        throw new UnauthorizedError("Invalid email or password.");
      }

      const dto = userEntityToDto(user);
      return Ok(dto);
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) {
        return Err(this.invalidCredentialsError());
      }
      if (err instanceof ValidationError) {
        return Err(this.validationError());
      }
      serverLogger.error(
        {
          context: "service.UserAuthFlowService.login",
          err,
          kind: "unexpected",
        },
        "Unexpected error during login",
      );
      return Err(this.unexpectedError());
    }
  }
}
