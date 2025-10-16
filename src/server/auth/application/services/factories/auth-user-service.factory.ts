import "server-only";
import { AuthUserRepositoryAdapter } from "@/server/auth/application/services/adapters/auth-user-repository.adapter";
import { BcryptPasswordHasher } from "@/server/auth/application/services/adapters/password-hasher-bcrypt.adapter";
import { AuthUserService } from "@/server/auth/application/services/auth-user.service";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/repositories/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";

/**
 * Composition root: builds a UserAuthService with concrete adapters.
 */
export function createAuthUserService(db: AppDatabase): AuthUserService {
  const repo = new AuthUserRepositoryImpl(db);
  const repoPort: AuthUserRepository = new AuthUserRepositoryAdapter(repo);
  const hasherPort: PasswordHasher = new BcryptPasswordHasher();
  return new AuthUserService(repoPort, hasherPort);
}
