import "server-only";
import type { UserUpdatePatch } from "@/modules/users/domain/types";
import type { UserDto } from "@/modules/users/domain/user.dto";
import type { UserId } from "@/shared/branding/brands";

export interface UserRepositoryPort<Trepo = unknown> {
  withTransaction<Tresult>(
    fn: (txRepo: UserRepositoryPort<Trepo>) => Promise<Tresult>,
  ): Promise<Tresult>;

  create(input: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<UserDto | null>;

  update(id: UserId, patch: UserUpdatePatch): Promise<UserDto | null>;

  delete(id: UserId): Promise<UserDto | null>;

  findById(id: UserId): Promise<UserDto | null>;

  findMany(query: string, page: number): Promise<UserDto[]>;

  count(query: string): Promise<number>;
}
