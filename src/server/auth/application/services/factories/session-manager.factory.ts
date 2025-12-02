// src/server/auth/application/services/factories/session-manager.factory.ts
import "server-only";
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import type { LoggingClientContract } from "@/shared/infrastructure/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/infrastructure/logging/infrastructure/logging.client";

/**
 * Lightweight factory to compose a SessionManager with default adapters.
 *
 * @param logger - optional logger to use; defaults to shared logger.
 */
export function createSessionManager(
  logger: LoggingClientContract = defaultLogger,
): SessionManager {
  return new SessionManager(
    createSessionCookieAdapter(),
    createSessionJwtAdapter(),
    logger,
  );
}
