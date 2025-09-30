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
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { AuthUserRepo } from "@/server/users/auth-flow-repo.user";
import { userEntityToDto } from "@/server/users/mapper";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";
import type { Result } from "@/shared/core/result/result-base";
import { Err, Ok } from "@/shared/core/result/result-base";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors";

// Helper to build a dense error map for signup fields
// Dense Errors probably do not add value here. Dense errors are good UI.
// Errors here should be like "username taken" or "email already exists"
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
// Dense Errors probably do not add value here. Dense errors are good UI.
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

export class UserAuthFlowService {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async authFlowSignupService(
    input: SignupData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<SignupField>>> {
    const repo = new AuthUserRepo(this.db);

    // Hash in the service
    const passwordHash = await hashPassword(input.password);

    const repoInput = {
      ...input,
      password: passwordHash,
      role: toUserRole("USER"),
    };

    try {
      const created = await repo.authRepoSignup(repoInput);

      // The service returns a DTO for the client; map minimally and safely
      const dto = userEntityToDto(created);

      return Ok(dto);
    } catch (err) {
      // Map infrastructure/domain errors to dense field errors
      if (err instanceof ConflictError) {
        return Err(
          denseSignupErrors({
            email: ["Email already in use"],
            username: ["Username already in use"],
          }),
        );
      }
      if (err instanceof UnauthorizedError) {
        return Err(
          denseSignupErrors({
            // No field-specific blame; attach a form-level message to a safe field
            email: ["Signups are currently disabled"],
          }),
        );
      }
      if (err instanceof ValidationError) {
        return Err(
          denseSignupErrors({
            // Example: push a generic validation message (adjust as needed)
            email: ["Invalid data"],
          }),
        );
      }
      if (err instanceof DatabaseError) {
        return Err(
          denseSignupErrors({
            email: ["Unexpected database error"],
          }),
        );
      }
      return Err(
        denseSignupErrors({
          email: ["Unknown error occurred"],
        }),
      );
    }
  }

  async authFlowLoginService(
    input: LoginData,
  ): Promise<Result<UserDto, DenseFieldErrorMap<LoginField>>> {
    const repo = new AuthUserRepo(this.db);

    // Do NOT hash here; DAL compares raw password to stored hash
    const repoInput = {
      ...input,
      password: input.password,
    };

    try {
      const user = await repo.authRepoLogin(repoInput);

      const dto = userEntityToDto(user);
      return Ok(dto);
    } catch (err) {
      // Map infrastructure/domain errors to dense field errors
      if (err instanceof UnauthorizedError) {
        return Err(
          denseLoginErrors({
            // Unified message for invalid credentials
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
      if (err instanceof DatabaseError) {
        return Err(
          denseLoginErrors({
            email: ["Unexpected database error"],
          }),
        );
      }
      return Err(
        denseLoginErrors({
          email: ["Unknown error occurred"],
        }),
      );
    }
  }
}
