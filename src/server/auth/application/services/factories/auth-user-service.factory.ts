import "server-only";
import { AuthUserRepositoryAdapter } from "@/server/auth/application/services/adapters/auth-user-repository.adapter";
import { BcryptPasswordHasherAdapter } from "@/server/auth/application/services/adapters/password-hasher-bcrypt.adapter";
import { AuthUserService } from "@/server/auth/application/services/auth-user.service";
import type { AuthUserRepositoryPort } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import { LoggerAdapter } from "@/shared/logging/logger.adapter";
import { logger as sharedLogger } from "@/shared/logging/logger.shared";

/**
 * Composition root: builds a UserAuthService with concrete adapters.
 */
export function createAuthUserService(db: AppDatabase): AuthUserService {
  const loggerPort = new LoggerAdapter(sharedLogger);
  const repo = new AuthUserRepositoryImpl(db, loggerPort);
  const repoPort: AuthUserRepositoryPort<AuthUserRepositoryImpl> =
    new AuthUserRepositoryAdapter(repo);
  const hasherPort: PasswordHasherPort = new BcryptPasswordHasherAdapter();
  return new AuthUserService(repoPort, hasherPort, loggerPort);
}
