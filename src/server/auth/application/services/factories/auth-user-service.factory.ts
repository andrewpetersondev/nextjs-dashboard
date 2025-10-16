import "server-only";
import { AuthUserRepositoryAdapter } from "@/server/auth/application/services/adapters/auth-user-repository.adapter";
import { CryptoPasswordHasher } from "@/server/auth/application/services/adapters/password-hasher-bcrypt.adapter";
import { AuthUserService } from "@/server/auth/application/services/auth-user.service";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { AuthUserRepo } from "@/server/auth/infrastructure/repository/repo/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";

/**
 * Composition root: builds a UserAuthService with concrete adapters.
 */
export function createAuthUserService(db: AppDatabase): AuthUserService {
  const repo = new AuthUserRepo(db);
  const repoPort: AuthUserRepository = new AuthUserRepositoryAdapter(repo);
  const hasherPort: PasswordHasher = new CryptoPasswordHasher();
  return new AuthUserService(repoPort, hasherPort);
}
