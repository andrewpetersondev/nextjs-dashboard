import "server-only";
import { AuthUserRepositoryAdapter } from "@/server/auth/application/services/adapters/auth-user-repository.adapter";
import { BcryptPasswordHasherAdapter } from "@/server/auth/application/services/adapters/password-hasher-bcrypt.adapter";
import { AuthUserService } from "@/server/auth/application/services/auth-user.service";
import type { AuthUserRepositoryPort } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import { logger } from "@/shared/logging/logger.shared";

/**
 * Composition root that builds an `AuthUserService` with concrete adapters.
 *
 * @param db - Database connection used by the repository implementation.
 * @returns A configured `AuthUserService`.
 */
export function createAuthUserService(db: AppDatabase): AuthUserService {
  const repo = new AuthUserRepositoryImpl(db, logger);
  const repoPort: AuthUserRepositoryPort<AuthUserRepositoryImpl> =
    new AuthUserRepositoryAdapter(repo);
  const hasherPort: PasswordHasherPort = new BcryptPasswordHasherAdapter();
  return new AuthUserService(repoPort, hasherPort, logger);
}
