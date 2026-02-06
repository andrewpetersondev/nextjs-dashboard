import "server-only";
import type {
  CreateUserProps,
  UserEntity,
} from "@/modules/users/domain/user.entity";
import type { UserPersistencePatch } from "@/modules/users/infrastructure/repository/user.repository.types";
import type { UserId } from "@/shared/branding/brands";

export interface UserRepositoryContract<Trepo = unknown> {
  withTransaction<Tresult>(
    fn: (txRepo: UserRepositoryContract<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;

  create(input: CreateUserProps): Promise<UserEntity | null>;

  update(id: UserId, patch: UserPersistencePatch): Promise<UserEntity | null>;

  delete(id: UserId): Promise<UserEntity | null>;

  readById(id: UserId): Promise<UserEntity | null>;

  readFilteredUsers(query: string, page: number): Promise<UserEntity[]>;

  readPageCount(query: string): Promise<number>;
}
