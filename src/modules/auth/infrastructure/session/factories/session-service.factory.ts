import "server-only";
import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import { SessionService } from "@/modules/auth/infrastructure/session/services/session.service";
import { sessionCookieStoreFactory } from "@/modules/auth/infrastructure/session-cookie/factories/session-cookie-store.factory";
import { sessionTokenServiceFactory } from "@/modules/auth/infrastructure/session-token/factories/session-token-service.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory: wires Infrastructure dependencies into a concrete SessionServiceContract implementation.
 */
export function sessionServiceFactory(
  logger: LoggingClientContract,
  requestId: string,
): SessionServiceContract {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  const deps: SessionUseCaseDependencies = {
    logger: scopedLogger,
    sessionStore: sessionCookieStoreFactory(scopedLogger),
    sessionTokenService: sessionTokenServiceFactory(scopedLogger),
  };

  return new SessionService(deps);
}
