import "server-only";
import type {
  CreateUserProps,
  UserEntity,
} from "@/modules/users/domain/user.entity";
import type { UserPersistencePatch } from "@/modules/users/server/infrastructure/repository/user.repository.types";
import type { UserId } from "@/shared/branding/brands";

export interface UserRepositoryPort<Trepo = unknown> {
  withTransaction<Tresult>(
    fn: (txRepo: UserRepositoryPort<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;

  create(input: CreateUserProps): Promise<UserEntity | null>;

  update(id: UserId, patch: UserPersistencePatch): Promise<UserEntity | null>;

  delete(id: UserId): Promise<UserEntity | null>;

  findById(id: UserId): Promise<UserEntity | null>;

  findMany(query: string, page: number): Promise<UserEntity[]>;

  getPageCount(query: string): Promise<number>;
}
