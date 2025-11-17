import "server-only";

import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";
import type { AppDatabase } from "@/server/db/db.connection";
import { createUserDal } from "@/server/users/dal/create";
import { BaseError } from "@/shared/errors/base-error";
import type { Result } from "@/shared/result/result";
import { Err, Ok } from "@/shared/result/result";

export type CreateUserRepoInput = {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
};

export type CreateUserRepoOutput = {
  readonly email: string;
  readonly id: string;
  readonly role: UserRole;
  readonly username: string;
};

/**
 * UsersRepository: DB-facing operations for users.
 * Emits BaseError for persistence failures.
 */
export class UsersRepository {
  private readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async createSafe(
    input: CreateUserRepoInput,
  ): Promise<Result<CreateUserRepoOutput, BaseError>> {
    try {
      const user = await createUserDal(this.db, {
        email: input.email,
        password: input.password,
        role: input.role,
        username: input.username,
      });
      if (!user) {
        return Err(
          new BaseError("notFound", {
            context: {
              email: input.email,
              operation: "createSafe",
              reason: "user_creation_returned_null",
              username: input.username,
            },
            formErrors: ["User creation returned null"],
          }),
        );
      }
      return Ok({
        email: user.email,
        id: String(user.id),
        role: user.role,
        username: user.username,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return Err(
        new BaseError("unknown", {
          context: {
            operation: "createSafe",
            reason: "create_user_db_error",
          },
          formErrors: [message],
        }),
      );
    }
  }
}
