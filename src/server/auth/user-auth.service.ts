import "server-only";

import type {
  LoginData,
  LoginField,
  SignupData,
  SignupField,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { hashPassword } from "@/server/auth/hashing";
import { AuthUserRepo } from "@/server/auth/user-auth.repository";
import type { Database } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { userEntityToDto } from "@/server/users/mapping/user.mappers";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";
import type { Result } from "@/shared/core/result/result-base";
import { Err, Ok } from "@/shared/core/result/result-base";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";

// Helper to build a dense error map for signup fields
function denseSignupErrors(
  partial: Partial<Record<SignupField, readonly string[]>>,
): DenseFieldErrorMap<SignupField> {
  const all: SignupField[] = ["email", "username", "password"];
  const out = {} as Record<SignupField, readonly string[]>;
  for (const k of all) {
    out[k] = partial[k] ?? [];
  }
  return out as DenseFieldErrorMap<SignupField>;
}

// Helper to build a dense error map for login fields
function denseLoginErrors(
  partial: Partial<Record<LoginField, readonly string[]>>,
): DenseFieldErrorMap<LoginField> {
  const all: LoginField[] = ["email", "password"];
  const out = {} as Record<LoginField, readonly string[]>;
  for (const k of all) {
    out[k] = partial[k] ?? [];
  }
  return out as DenseFieldErrorMap<LoginField>;
}

/**
 * Auth service: orchestrates business logic, returns discriminated Result.
 * Never throws; always returns Result union for UI.
 */
export class UserAuthFlowService {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Signup: hashes password, delegates to repo, returns Result<UserDto, DenseErrorMap>.
   */
  async signup(
    input: SignupData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<SignupField>>> {
    const repo = new AuthUserRepo(this.db);

    try {
      const passwordHash = await hashPassword(input.password);
      const repoInput = {
        ...input,
        password: passwordHash,
        role: toUserRole("USER"),
      };
      const created = await repo.signup(repoInput);
      const dto = userEntityToDto(created);
      return Ok(dto);
    } catch (err) {
      // Map known errors to dense error map
      if (err instanceof ConflictError) {
        return Err(
          denseSignupErrors({
            email: ["Email already in use"],
            username: ["Username already in use"],
          }),
        );
      }
      if (err instanceof ValidationError) {
        return Err(
          denseSignupErrors({
            email: ["Invalid data"],
          }),
        );
      }
      // Unexpected errors: log and return generic error
      serverLogger.error({
        context: "UserAuthFlowService.signup",
        error: err,
        message: "Unexpected error during signup.",
      });
      return Err(
        denseSignupErrors({
          email: ["Unexpected error occurred"],
        }),
      );
    }
  }

  /**
   * Login flow: delegates to repo, returns UserDto in Result.
   * Never throws; always returns Result union for UI.
   */
  async login(
    input: LoginData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<LoginField>>> {
    const repo = new AuthUserRepo(this.db);

    try {
      // Pass raw password to repo; repo/DAL will handle verification
      const repoInput = {
        ...input,
        password: input.password,
      };

      const user = await repo.login(repoInput);

      const dto = userEntityToDto(user);
      return Ok(dto);
    } catch (err) {
      // Map known domain errors to dense error map
      if (err instanceof UnauthorizedError) {
        return Err(
          denseLoginErrors({
            email: ["Invalid email or password"],
            password: ["Invalid email or password"],
          }),
        );
      }
      if (err instanceof ValidationError) {
        return Err(
          denseLoginErrors({
            email: ["Invalid data"],
          }),
        );
      }
      // Unexpected infra errors: log and return generic error
      serverLogger.error({
        context: "UserAuthFlowService.login",
        email: input?.email,
        error: err,
        message: "Unexpected error during login.",
      });
      return Err(
        denseLoginErrors({
          email: ["Unexpected error occurred"],
        }),
      );
    }
  }
}
