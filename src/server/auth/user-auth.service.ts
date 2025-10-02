import "server-only";

import type {
  LoginData,
  LoginField,
  SignupData,
  SignupField,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { comparePassword, hashPassword } from "@/server/auth/hashing";
import { asPasswordHash } from "@/server/auth/types/password.types";
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
      // Hash raw password then brand as PasswordHash before persistence boundary
      const hashed: string = await hashPassword(
        input.password as unknown as string,
      );
      const passwordHash = asPasswordHash(hashed);

      const repoInput = {
        email: input.email,
        passwordHash,
        role: toUserRole("USER"),
        username: input.username,
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
            password: [],
            username: ["Username already in use"],
          }),
        );
      }
      if (err instanceof ValidationError) {
        return Err(
          denseSignupErrors({
            email: ["Invalid data"],
            password: [],
            username: [],
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
          password: [],
          username: [],
        }),
      );
    }
  }

  /**
   * Login: fetch user by email, compare raw vs stored hash in Service.
   */
  async login(
    input: LoginData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<LoginField>>> {
    const repo = new AuthUserRepo(this.db);

    try {
      // Fetch user by email; Repo/DAL must include stored password hash on entity.
      const user = await repo.login({ email: input.email });

      // Defensive: ensure hashed password exists before comparing
      if (!user.password || typeof user.password !== "string") {
        serverLogger.error(
          { context: "UserAuthFlowService.login", email: input.email },
          "Missing hashed password on user entity; cannot authenticate",
        );
        throw new UnauthorizedError("Invalid email or password.");
      }

      // Compare in Service layer
      const ok = await comparePassword(
        input.password as unknown as string,
        user.password as unknown as string,
      );
      if (!ok) {
        throw new UnauthorizedError("Invalid email or password.");
      }

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
            password: [],
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
          password: [],
        }),
      );
    }
  }
}
