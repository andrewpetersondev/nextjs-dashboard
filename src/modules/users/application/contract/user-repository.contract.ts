import "server-only";
import type {
  CreateUserProps,
  UserEntity,
} from "@/modules/users/domain/user.entity";
import type { UserPersistencePatch } from "@/modules/users/infrastructure/repository/user.repository.types";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export interface UserRepositoryContract<Trepo = unknown> {
  create(input: CreateUserProps): Promise<Result<UserEntity | null, AppError>>;

  delete(id: UserId): Promise<Result<UserEntity | null, AppError>>;

  readById(id: UserId): Promise<Result<UserEntity | null, AppError>>;

  readFilteredUsers(
    query: string,
    page: number,
  ): Promise<Result<UserEntity[], AppError>>;

  readPageCount(query: string): Promise<Result<number, AppError>>;

  update(
    id: UserId,
    patch: UserPersistencePatch,
  ): Promise<Result<UserEntity | null, AppError>>;

  withTransaction<Tresult>(
    fn: (txRepo: UserRepositoryContract<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;
}
