import type { SignupFormOutput } from "@/features/auth/lib/auth.schema";
import type { UserDto } from "@/features/users/lib/dto";
import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import {
  AuthUserRepo,
  ConflictError,
  ValidationError,
} from "@/server/users/auth-flow-repo.user";
import type { AuthSignupDalInput } from "@/server/users/dal/auth-flow-signup.dal";
import { userEntityToDto } from "@/server/users/mapper";
import { UnauthorizedError } from "@/shared/core/errors/domain";
import type { Result } from "@/shared/core/result/result-base";
import { Err, Ok } from "@/shared/core/result/result-base";

export class UserAuthFlowService {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async authFlowSignupService(
    input: SignupFormOutput,
  ): Promise<Result<UserDto, { kind: string; message: string }>> {
    const repo = new AuthUserRepo(this.db);

    // Narrow the signup input to what the DAL/repo expects
    const repoInput: AuthSignupDalInput = {
      email: input.email,
      password: input.password,
      username: input.username,
    };

    try {
      const created = await repo.authRepoSignup(repoInput);
      // Map repo output to UserDto shape
      const dto: UserDto = userEntityToDto({
        email: created.email,
        id: created.id,
        role: created.role,
        username: created.username,
        // ... any other fields defaulted/omitted by entity factory if needed
      } as any);

      return Ok(dto);
    } catch (err) {
      // Map known errors to user-facing Result errors
      if (err instanceof ConflictError) {
        return Err({
          kind: "Conflict",
          message: "An account with that email or username already exists.",
        });
      }
      if (err instanceof UnauthorizedError) {
        return Err({
          kind: "Unauthorized",
          message: "You are not allowed to sign up.",
        });
      }
      if (err instanceof ValidationError) {
        return Err({
          kind: "Validation",
          message: "Signup data failed validation.",
        });
      }
      if (err instanceof DatabaseError) {
        return Err({
          kind: "DatabaseError",
          message: "A database error occurred while creating your account.",
        });
      }

      // Fallback unknown
      return Err({
        kind: "Unknown",
        message: "Something went wrong while creating your account.",
      });
    }
  }
}
