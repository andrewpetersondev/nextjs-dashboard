import "server-only";
import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import { AuthUserRepositoryAdapter } from "@/modules/auth/server/infrastructure/adapters/auth-user-repository.adapter";
import { AuthUserRepositoryImpl } from "@/modules/auth/server/infrastructure/repository/auth-user.repository";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Composition root that builds an `AuthUserService` with concrete adapters.
 *
 * @param db - Database connection used by the repository implementation.
 * @param logger - Optional logger; defaults to the shared logger.
 * @param requestId - Optional request ID for tracing across layers.
 * @returns A configured `AuthUserService`.
 */
export function createAuthUserServiceFactory(
  db: AppDatabase,
  logger: LoggingClientContract = defaultLogger,
  requestId?: string,
): AuthUserService {
  const repo = new AuthUserRepositoryImpl(db, logger, requestId);
  const repoPort: AuthUserRepositoryPort<AuthUserRepositoryImpl> =
    new AuthUserRepositoryAdapter(repo);
  const hashingService = createHashingService();
  return new AuthUserService(repoPort, hashingService, requestId);
}
