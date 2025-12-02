// src/server/auth/application/services/factories/session-manager.factory.ts
import "server-only";
import { SessionManager } from "@/modules/auth/server/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/modules/auth/server/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/modules/auth/server/infrastructure/adapters/session-jwt.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

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
