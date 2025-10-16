import "server-only";
import {
  asPasswordHash,
  type PasswordHash,
} from "@/server/auth/domain/types/password.types";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/repositories/auth-user.repository";
import type { UserEntity } from "@/server/users/types/entity";

export class AuthUserRepositoryAdapter
  implements AuthUserRepository<AuthUserRepositoryImpl>
{
  private readonly repo: AuthUserRepositoryImpl;

  constructor(repo: AuthUserRepositoryImpl) {
    this.repo = repo;
  }

  withTransaction<T>(
    fn: (txRepo: AuthUserRepository<AuthUserRepositoryImpl>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new AuthUserRepositoryAdapter(txRepo);
      return await fn(txAdapter);
    });
  }

  signup(input: {
    email: string;
    username: string;
    passwordHash: PasswordHash;
    role: UserEntity["role"];
  }) {
    // If input.role may be untrusted, normalize or validate here instead of casting.
    return this.repo.signup({
      email: input.email,
      passwordHash: asPasswordHash(input.passwordHash),
      role: input.role as UserEntity["role"],
      username: input.username,
    });
  }

  login(input: { email: string }) {
    return this.repo.login({ email: input.email });
  }
}
