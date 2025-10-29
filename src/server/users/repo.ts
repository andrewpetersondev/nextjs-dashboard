import "server-only";

import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { createUserDal } from "@/server/users/dal/create";
import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import type { Result } from "@/shared/core/result/result";
import { Err, Ok } from "@/shared/core/result/result";

export type CreateUserRepoInput = {
  readonly username: string;
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
};

export type CreateUserRepoOutput = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
};

export type RepoError =
  | { code: ErrorCode; kind: "DatabaseError"; message: string }
  | { code: ErrorCode; kind: "CreateFailed"; message: string };

/**
 * UsersRepository: DB-facing operations for users.
 * Emits RepoError variants for persistence failures.
 */
export class UsersRepository {
  private readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async createSafe(
    input: CreateUserRepoInput,
  ): Promise<Result<CreateUserRepoOutput, RepoError>> {
    try {
      const user = await createUserDal(this.db, {
        email: input.email,
        password: input.password,
        role: input.role,
        username: input.username,
      });
      if (!user) {
        return Err({
          code: "notFound" as const,
          kind: "CreateFailed" as const,
          message: "User creation returned null",
        });
      }
      return Ok({
        email: user.email,
        id: String(user.id),
        role: user.role,
        username: user.username,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return Err({
        code: "unknown" as const,
        kind: "DatabaseError" as const,
        message,
      });
    }
  }
}
