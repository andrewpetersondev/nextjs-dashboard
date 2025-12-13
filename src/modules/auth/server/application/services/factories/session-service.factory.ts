import "server-only";

import { SessionService } from "@/modules/auth/server/application/services/session.service";
import { createSessionCookieAdapter } from "@/modules/auth/server/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/modules/auth/server/infrastructure/adapters/session-jwt.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Lightweight factory to compose a SessionManager with default adapters.
 *
 * @param logger - Optional logger to use; defaults to the shared logger.
 */
export function createSessionServiceFactory(
  logger: LoggingClientContract = defaultLogger,
): SessionService {
  return new SessionService(
    createSessionCookieAdapter(),
    createSessionJwtAdapter(),
    logger,
  );
}
