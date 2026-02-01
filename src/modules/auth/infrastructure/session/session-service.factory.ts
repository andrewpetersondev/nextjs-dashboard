import "server-only";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import type { SessionUseCaseDeps } from "@/modules/auth/application/session/use-cases/session-use-case.deps";
import { sessionCookieStoreFactory } from "@/modules/auth/infrastructure/session/cookie/factories/session-cookie-store.factory";
import { SessionService } from "@/modules/auth/infrastructure/session/session.service";
import { sessionTokenServiceFactory } from "@/modules/auth/infrastructure/session/token/factories/session-token-service.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the session service.
 *
 * Wires infrastructure dependencies into a concrete {@link SessionServiceContract} implementation.
 *
 * @param logger - The logging client.
 * @param requestId - Unique identifier for the current request.
 * @returns An implementation of the {@link SessionServiceContract}.
 */
export function sessionServiceFactory(
  logger: LoggingClientContract,
  requestId: string,
): SessionServiceContract {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  const deps: SessionUseCaseDeps = {
    logger: scopedLogger,
    sessionStore: sessionCookieStoreFactory(scopedLogger),
    sessionTokenService: sessionTokenServiceFactory(scopedLogger),
  };

  return new SessionService(deps);
}
