import "server-only";

import { SessionService } from "@/modules/auth/application/services/session.service";
import { createSessionCookieAdapter } from "@/modules/auth/infrastructure/session/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/modules/auth/infrastructure/session/adapters/session-jwt.adapter";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

/**
 * Lightweight factory to compose a SessionService with default adapters.
 */
export function createSessionServiceFactory(
  logger: LoggingClientPort,
  requestId: string,
): SessionService {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  return new SessionService(
    createSessionCookieAdapter(),
    createSessionJwtAdapter(),
    scopedLogger,
  );
}
