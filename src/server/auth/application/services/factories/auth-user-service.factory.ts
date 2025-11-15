// src/server/auth/application/services/factories/auth-user-service.factory.ts
import "server-only";
import type { AuthUserRepositoryPort } from "@/server/auth/application/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/server/auth/application/ports/password-hasher.port";
import { AuthUserService } from "@/server/auth/application/services/auth-user.service";
import { AuthUserRepositoryAdapter } from "@/server/auth/infrastructure/adapters/auth-user-repository.adapter";
import { BcryptPasswordHasherAdapter } from "@/server/auth/infrastructure/adapters/password-hasher-bcrypt.adapter";
import { AuthUserRepositoryImpl } from "@/server/auth/infrastructure/repository/auth-user.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import {
  logger as defaultLogger,
  type Logger,
} from "@/shared/logging/logger.shared";

/**
 * Composition root that builds an `AuthUserService` with concrete adapters.
 *
 * @param db - Database connection used by the repository implementation.
 * @param logger -
 * @returns A configured `AuthUserService`.
 */
export function createAuthUserService(
  db: AppDatabase,
  logger: Logger = defaultLogger,
): AuthUserService {
  const repo = new AuthUserRepositoryImpl(db, logger);
  const repoPort: AuthUserRepositoryPort<AuthUserRepositoryImpl> =
    new AuthUserRepositoryAdapter(repo);
  const hasherPort: PasswordHasherPort = new BcryptPasswordHasherAdapter();
  return new AuthUserService(repoPort, hasherPort, logger);
}
