import "server-only";
import type { UserEntity } from "@/modules/users/domain/entity";
import type { UserUpdatePatch } from "@/modules/users/domain/types";
import type { UserId } from "@/shared/branding/brands";

export interface UserRepositoryPort<Trepo = unknown> {
  withTransaction<Tresult>(
    fn: (txRepo: UserRepositoryPort<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;

  create(input: {
    email: string;
    password: string;
    role: string;
    username: string;
  }): Promise<UserEntity | null>;

  update(id: UserId, patch: UserUpdatePatch): Promise<UserEntity | null>;

  delete(id: UserId): Promise<UserEntity | null>;

  findById(id: UserId): Promise<UserEntity | null>;

  findMany(query: string, page: number): Promise<UserEntity[]>;

  getPageCount(query: string): Promise<number>;
}
