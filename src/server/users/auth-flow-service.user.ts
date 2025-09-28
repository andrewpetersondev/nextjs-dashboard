import type {
  SignupFormFieldNames,
  SignupFormOutput,
} from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import { hashPassword } from "@/server/auth/hashing";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { AuthUserRepo } from "@/server/users/auth-flow-repo.user";
import type { AuthSignupDalInput } from "@/server/users/dal/auth-flow-signup.dal";
import { userEntityToDto } from "@/server/users/mapper";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";
import type { Result } from "@/shared/core/result/result-base";
import { Err, Ok } from "@/shared/core/result/result-base";
import type { DenseFieldErrorMap } from "@/shared/forms/form-types";

// Helper to build a dense error map for signup fields
function denseSignupErrors(
  partial: Partial<Record<SignupFormFieldNames, readonly string[]>>,
): DenseFieldErrorMap<SignupFormFieldNames> {
  const all: SignupFormFieldNames[] = ["email", "username", "password"];
  const out = {} as Record<SignupFormFieldNames, readonly string[]>;
  for (const k of all) {
    out[k] = partial[k] ?? [];
  }
  return out as DenseFieldErrorMap<SignupFormFieldNames>;
}

export class UserAuthFlowService {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
  async authFlowSignupService(
    input: SignupFormOutput,
  ): Promise<Result<UserDto, DenseFieldErrorMap<SignupFormFieldNames>>> {
    const repo = new AuthUserRepo(this.db);

    // Normalize minimal fields here if desired
    // all normalization should be included in zod schema making this unnecessary
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedUsername = input.username.trim();

    // Hash in the service
    const passwordHash = await hashPassword(input.password);

    const repoInput: AuthSignupDalInput = {
      email: normalizedEmail,
      password: passwordHash,
      username: normalizedUsername,
    };

    try {
      const created = await repo.authRepoSignup(repoInput);

      // The service returns a DTO for the client; map minimally and safely
      const dto: UserDto = userEntityToDto({
        email: created.email,
        id: created.id,
        role: created.role,
        username: created.username,
      } as any);

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
}
