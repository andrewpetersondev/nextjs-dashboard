import "server-only";

import { SessionService } from "@/modules/auth/application/services/session.service";
import { createSessionCookieAdapter } from "@/modules/auth/infrastructure/session-store/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/modules/auth/infrastructure/session-store/adapters/session-jwt.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Lightweight factory to compose a SessionService with default adapters.
 */
export function createSessionServiceFactory(
  logger: LoggingClientContract,
  requestId: string,
): SessionService {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  return new SessionService(
    createSessionCookieAdapter(),
    createSessionJwtAdapter(),
    scopedLogger,
  );
}
