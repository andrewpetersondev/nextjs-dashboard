import "server-only";

import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";
import { AuthUserService } from "@/modules/auth/server/application/services/auth-user.service";
import { AuthUserRepository } from "@/modules/auth/server/infrastructure/persistence/auth-user.repository";
import { AuthUserRepositoryAdapter } from "@/modules/auth/server/infrastructure/persistence/auth-user-repository.adapter";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Composition root for the Auth module that wires up an {@link AuthUserService}
 * with concrete infrastructure implementations.
 *
 * ## What this factory does
 * - Creates the infrastructure repository ({@link AuthUserRepository})
 * - Wraps it in an application-facing port via {@link AuthUserRepositoryAdapter}
 * - Builds a hashing service (via {@link createHashingService})
 * - Scopes the logger with an `"auth"` context and optionally binds a request id
 *
 * ## Why a factory
 * Keeping object construction here:
 * - Prevents the service from importing infrastructure concerns directly
 * - Centralizes wiring for consistency and testability
 * - Allows request-scoped dependencies (e.g., `requestId`) without global state
 *
 * ## Server-only
 * This module is intended to run on the server (e.g., Next.js server components,
 * route handlers, and server actions).
 *
 * @param db - Database connection used by the repository implementation.
 * @param logger - Logger instance; defaults to the shared logger.
 * @param requestId - Optional request id for tracing/log correlation across layers.
 * @returns A configured {@link AuthUserService} instance ready for use.
 */
export function createAuthUserServiceFactory(
  db: AppDatabase,
  logger: LoggingClientContract = defaultLogger,
  requestId?: string,
): AuthUserService {
  const repo = new AuthUserRepository(db, logger, requestId);
  const repoPort: AuthUserRepositoryPort = new AuthUserRepositoryAdapter(repo);
  const hashingService = createHashingService();

  const scopedLogger = requestId
    ? logger.withContext("auth").withRequest(requestId)
    : logger.withContext("auth");

  return new AuthUserService(repoPort, hashingService, scopedLogger);
}
