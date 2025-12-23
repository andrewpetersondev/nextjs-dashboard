import "server-only";

import { SessionService } from "@/modules/auth/server/application/services/session.service";
import { createSessionCookieAdapter } from "@/modules/auth/server/infrastructure/session/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/modules/auth/server/infrastructure/session/adapters/session-jwt.adapter";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";

/**
 * Lightweight factory to compose a SessionManager with default adapters.
 *
 * @param logger - required logger to use.
 * @param requestId - request id for tracing/log correlation across layers.
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
