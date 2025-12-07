import "server-only";
import type { UserEntity } from "@/modules/users/domain/entity";
import type { UserUpdatePatch } from "@/modules/users/domain/types";
import type { UserRepositoryPort } from "@/modules/users/server/application/ports/user-repository.port";
import type { UserRepositoryImpl } from "@/modules/users/server/infrastructure/repository/user.repository";
import type { UserId } from "@/shared/branding/brands";

export class UserRepositoryAdapter
  implements UserRepositoryPort<UserRepositoryImpl>
{
  private readonly repo: UserRepositoryImpl;

  constructor(repo: UserRepositoryImpl) {
    this.repo = repo;
  }

  withTransaction<T>(
    fn: (txRepo: UserRepositoryPort<UserRepositoryImpl>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new UserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }

  create(input: {
    email: string;
    password: string;
    role: string;
    username: string;
  }): Promise<UserEntity | null> {
    return this.repo.create(input);
  }

  update(id: UserId, patch: UserUpdatePatch): Promise<UserEntity | null> {
    return this.repo.update(id, patch);
  }

  delete(id: UserId): Promise<UserEntity | null> {
    return this.repo.delete(id);
  }

  findById(id: UserId): Promise<UserEntity | null> {
    return this.repo.findById(id);
  }

  findMany(query: string, page: number): Promise<UserEntity[]> {
    return this.repo.findMany(query, page);
  }

  count(query: string): Promise<number> {
    return this.repo.count(query);
  }
}
