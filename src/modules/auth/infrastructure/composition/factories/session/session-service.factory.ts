import "server-only";
import type { SessionUseCaseDeps } from "@/modules/auth/application/session/commands/session-use-case.deps";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import { sessionCookieStoreFactory } from "@/modules/auth/infrastructure/composition/factories/session/session-cookie-store.factory";
import { sessionTokenServiceFactory } from "@/modules/auth/infrastructure/composition/factories/session/session-token-service.factory";
import { SessionService } from "@/modules/auth/infrastructure/session/services/session.service";
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
