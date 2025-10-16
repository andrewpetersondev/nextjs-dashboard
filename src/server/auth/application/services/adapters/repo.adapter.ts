import "server-only";
import { asPasswordHash } from "@/server/auth/domain/types/password.types";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/user-auth.repository.port";
import type { AuthUserRepo } from "@/server/auth/infrastructure/repository/user-auth.repository";
import type { UserEntity } from "@/server/users/types/entity";

export class RepoAdapter implements AuthUserRepository<AuthUserRepo> {
  private readonly repo: AuthUserRepo;

  constructor(repo: AuthUserRepo) {
    this.repo = repo;
  }

  withTransaction<T>(
    fn: (txRepo: AuthUserRepository<AuthUserRepo>) => Promise<T>,
  ): Promise<T> {
    return this.repo.withTransaction(async (txRepo) => {
      const txAdapter = new RepoAdapter(txRepo);
      return await fn(txAdapter);
    });
  }

  signup(input: {
    email: string;
    username: string;
    passwordHash: string;
    role: string;
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
