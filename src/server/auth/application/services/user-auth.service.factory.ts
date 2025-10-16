import "server-only";
import { CryptoPasswordHasher } from "@/server/auth/application/services/adapters/bcrypt-password-hasher.adapter";
import { RepoAdapter } from "@/server/auth/application/services/adapters/repo.adapter";
import { UserAuthService } from "@/server/auth/application/services/user-auth.service";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/user-auth.repository.port";
import { AuthUserRepo } from "@/server/auth/infrastructure/repository/user-auth.repository";
import type { AppDatabase } from "@/server/db/db.connection";

/**
 * Composition root: builds a UserAuthService with concrete adapters.
 */
export function createUserAuthService(db: AppDatabase): UserAuthService {
  const repo = new AuthUserRepo(db);
  const repoPort: AuthUserRepository = new RepoAdapter(repo);
  const hasherPort: PasswordHasher = new CryptoPasswordHasher();
  return new UserAuthService(repoPort, hasherPort);
}
