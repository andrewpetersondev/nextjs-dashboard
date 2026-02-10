import "server-only";
import type {
  CreateUserProps,
  UserEntity,
} from "@/modules/users/domain/user.entity";
import { createUserDal } from "@/modules/users/infrastructure/repository/dal/create-user.dal";
import { deleteUserDal } from "@/modules/users/infrastructure/repository/dal/delete-user.dal";
import { readFilteredUsersDal } from "@/modules/users/infrastructure/repository/dal/read-filtered-users.dal";
import { readUserDal } from "@/modules/users/infrastructure/repository/dal/read-user.dal";
import { readUsersPageCountDal } from "@/modules/users/infrastructure/repository/dal/read-users-page-count.dal";
import { updateUserDal } from "@/modules/users/infrastructure/repository/dal/update-user.dal";
import type { UserPersistencePatch } from "@/modules/users/infrastructure/repository/user.repository.types";
import type { AppDatabase } from "@/server/db/db.connection";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export class UserRepositoryImpl {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async create(
    input: CreateUserProps,
  ): Promise<Result<UserEntity | null, AppError>> {
    return await createUserDal(this.db, input);
  }

  async delete(id: UserId): Promise<Result<UserEntity | null, AppError>> {
    return await deleteUserDal(this.db, id);
  }

  async readById(id: UserId): Promise<Result<UserEntity | null, AppError>> {
    return await readUserDal(this.db, id);
  }

  async readFilteredUsers(
    query: string,
    page: number,
  ): Promise<Result<UserEntity[], AppError>> {
    return await readFilteredUsersDal(this.db, query, page);
  }

  async readPageCount(query: string): Promise<Result<number, AppError>> {
    return await readUsersPageCountDal(this.db, query);
  }

  async update(
    id: UserId,
    patch: UserPersistencePatch,
  ): Promise<Result<UserEntity | null, AppError>> {
    return await updateUserDal(this.db, id, patch);
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
}
