import "server-only";
import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionUseCaseDependencies } from "@/modules/auth/application/contracts/session-use-case-dependencies.contract";
import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import { EstablishSessionUseCase } from "@/modules/auth/application/use-cases/establish-session.use-case";
import { ReadSessionUseCase } from "@/modules/auth/application/use-cases/read-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/application/use-cases/rotate-session.use-case";
import { TerminateSessionUseCase } from "@/modules/auth/application/use-cases/terminate-session.use-case";
import { VerifySessionUseCase } from "@/modules/auth/application/use-cases/verify-session.use-case";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session.policy";
import { makeCookieSessionStoreAdapter } from "@/modules/auth/infrastructure/factories/cookie-session-store.factory";
import { makeJwtSessionTokenServiceAdapter } from "@/modules/auth/infrastructure/factories/jwt-session-token-service.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Composition Root for Session operations.
 * Returns a wired implementation of the SessionServiceContract.
 */
export function createSessionService(
  logger: LoggingClientContract,
  requestId: string,
): SessionServiceContract {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);

  const deps: SessionUseCaseDependencies = {
    logger: scopedLogger,
    // TODO: confirm if i should be passing in the scoped logger to sessionStore
    sessionStore: makeCookieSessionStoreAdapter(scopedLogger),
    sessionTokenService: makeJwtSessionTokenServiceAdapter(scopedLogger),
  };

  return {
    establish: (user: SessionPrincipalDto) =>
      new EstablishSessionUseCase(deps).execute(user),
    read: () => new ReadSessionUseCase(deps).execute(),
    rotate: () => new RotateSessionUseCase(deps).execute(),
    terminate: (reason: TerminateSessionReason) =>
      new TerminateSessionUseCase(deps).execute(reason),
    verify: () => new VerifySessionUseCase(deps).execute(),
  };
}
