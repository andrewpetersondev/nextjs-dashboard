import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type { UserEntity } from "@/modules/users/domain/entity";
import type { UserUpdatePatch } from "@/modules/users/domain/types";
import { createUserDal } from "@/modules/users/server/infrastructure/repository/dal/create";
import { deleteUserDal } from "@/modules/users/server/infrastructure/repository/dal/delete";
import { fetchFilteredUsers } from "@/modules/users/server/infrastructure/repository/dal/fetch-filtered-users";
import { fetchUserById } from "@/modules/users/server/infrastructure/repository/dal/fetch-user-by-id";
import { fetchUsersPages } from "@/modules/users/server/infrastructure/repository/dal/fetch-users-pages";
import { updateUserDal } from "@/modules/users/server/infrastructure/repository/dal/update";
import type { AppDatabase } from "@/server-core/db/db.connection";
import type { UserId } from "@/shared/branding/brands";

export class UserRepositoryImpl {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async withTransaction<T>(
    fn: (txRepo: UserRepositoryImpl) => Promise<T>,
  ): Promise<T> {
    const dbWithTx = this.db as AppDatabase & {
      transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
    };

    if (typeof dbWithTx.transaction !== "function") {
      throw new Error("Database does not support transactions");
    }

    return await dbWithTx.transaction(async (tx: AppDatabase) => {
      const txRepo = new UserRepositoryImpl(tx);
      return await fn(txRepo);
    });
  }

  async create(input: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<UserEntity | null> {
    return await createUserDal(this.db, {
      email: input.email,
      password: input.password as PasswordHash,
      role: input.role as UserRole,
      username: input.username,
    });
  }

  async update(id: UserId, patch: UserUpdatePatch): Promise<UserEntity | null> {
    return await updateUserDal(this.db, id, patch);
  }

  async delete(id: UserId): Promise<UserEntity | null> {
    return await deleteUserDal(this.db, id);
  }

  async findById(id: UserId): Promise<UserEntity | null> {
    return await fetchUserById(this.db, id);
  }

  async findMany(query: string, page: number): Promise<UserEntity[]> {
    return await fetchFilteredUsers(this.db, query, page);
  }

  async count(query: string): Promise<number> {
    return await fetchUsersPages(this.db, query);
  }
}
