// src/server/auth/application/services/factories/auth-user-service.factory.ts
import "server-only";
import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import type { PasswordHasherPort } from "@/modules/auth/server/application/ports/password-hasher.port";
import { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import { AuthUserRepositoryAdapter } from "@/modules/auth/server/infrastructure/adapters/auth-user-repository.adapter";
import { BcryptPasswordHasherAdapter } from "@/modules/auth/server/infrastructure/adapters/password-hasher-bcrypt.adapter";
import { AuthUserRepositoryImpl } from "@/modules/auth/server/infrastructure/repository/auth-user.repository";
import type { AppDatabase } from "@/server-core/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Composition root that builds an `AuthUserService` with concrete adapters.
 *
 * @param db - Database connection used by the repository implementation.
 * @param logger -
 * @param requestId
 * @returns A configured `AuthUserService`.
 */
export function createAuthUserService(
  db: AppDatabase,
  logger: LoggingClientContract = defaultLogger,
  requestId?: string,
): AuthUserService {
  const repo = new AuthUserRepositoryImpl(db, logger, requestId);
  const repoPort: AuthUserRepositoryPort<AuthUserRepositoryImpl> =
    new AuthUserRepositoryAdapter(repo);
  const hasherPort: PasswordHasherPort = new BcryptPasswordHasherAdapter();
  return new AuthUserService(repoPort, hasherPort, logger);
}
