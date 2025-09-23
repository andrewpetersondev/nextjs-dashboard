import "server-only";

import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { Database } from "@/server/db/connection";
import { createUserDal } from "@/server/users/dal/create";
import type { Result } from "@/shared/core/result/result-base";
import { Err, Ok } from "@/shared/core/result/result-base";

export type CreateUserRepoInput = {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
};

export type CreateUserRepoOutput = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
};

export type RepoError =
  | { kind: "DatabaseError"; message: string }
  | { kind: "CreateFailed"; message: string };

/**
 * UsersRepository: DB-facing operations for users.
 * Emits RepoError variants for persistence failures.
 */
export class UsersRepository {
  private readonly db: Database;

  constructor(db: Database) {
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
          kind: "CreateFailed",
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
      return Err({ kind: "DatabaseError", message });
    }
  }
}
