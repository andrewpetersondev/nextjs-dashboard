import "server-only";
import { comparePassword, hashPassword } from "@/server/auth/crypto/hashing";
import { AuthUserRepo } from "@/server/auth/repo/user-auth.repository";
import {
  asPasswordHash,
  type PasswordHash,
} from "@/server/auth/types/password.types";
import type { AppDatabase } from "@/server/db/db.connection";
import type { UserEntity } from "@/server/users/types/entity";
import type { AuthUserRepository, PasswordHasher } from "./ports";
import { UserAuthFlowService } from "./user-auth.service";

// Concrete PasswordHasher adapter over hashing module (raw is plain string)
class CryptoPasswordHasher implements PasswordHasher {
  async hash(raw: string): Promise<PasswordHash> {
    const hashed = await hashPassword(raw);
    return asPasswordHash(hashed);
  }
  async compare(raw: string, hash: PasswordHash): Promise<boolean> {
    return await comparePassword(raw, hash as string);
  }
}

// Concrete Repo adapter over AuthUserRepo
class RepoAdapter implements AuthUserRepository<AuthUserRepo> {
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

/**
 * Composition root: builds a UserAuthFlowService with concrete adapters.
 */
export function createUserAuthFlowService(
  db: AppDatabase,
): UserAuthFlowService {
  const repo = new AuthUserRepo(db);
  const repoPort: AuthUserRepository = new RepoAdapter(repo);
  const hasherPort: PasswordHasher = new CryptoPasswordHasher();
  return new UserAuthFlowService(repoPort, hasherPort);
}
