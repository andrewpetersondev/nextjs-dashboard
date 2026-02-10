import "server-only";
import type { UserRepositoryContract } from "@/modules/users/application/contracts/user-repository.contract";
import type {
  CreateUserProps,
  UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import type { UserRepositoryImpl } from "@/modules/users/infrastructure/repository/user.repository";
import type { UserPersistencePatch } from "@/modules/users/infrastructure/repository/user.repository.types";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export class UserRepositoryAdapter
  implements UserRepositoryContract<UserRepositoryImpl>
{
  private readonly repo: UserRepositoryImpl;

  constructor(repo: UserRepositoryImpl) {
    this.repo = repo;
  }

  create(input: CreateUserProps): Promise<Result<UserEntity | null, AppError>> {
    return this.repo.create(input);
  }

  delete(id: UserId): Promise<Result<UserEntity | null, AppError>> {
    return this.repo.delete(id);
  }

  readById(id: UserId): Promise<Result<UserEntity | null, AppError>> {
    return this.repo.readById(id);
  }

  readFilteredUsers(
    query: string,
    page: number,
  ): Promise<Result<UserEntity[], AppError>> {
    return this.repo.readFilteredUsers(query, page);
  }

  readPageCount(query: string): Promise<Result<number, AppError>> {
    return this.repo.readPageCount(query);
  }

  update(
    id: UserId,
    patch: UserPersistencePatch,
  ): Promise<Result<UserEntity | null, AppError>> {
    return this.repo.update(id, patch);
  }

  withTransaction<T>(
    fn: (txRepo: UserRepositoryContract<UserRepositoryImpl>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new UserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }
}
