import "server-only";

import { EstablishSessionUseCase } from "@/modules/auth/application/use-cases/establish-session.use-case";
import { GetSessionUseCase } from "@/modules/auth/application/use-cases/get-session.use-case";
import { RotateSessionUseCase } from "@/modules/auth/application/use-cases/rotate-session.use-case";
import { TerminateSessionUseCase } from "@/modules/auth/application/use-cases/terminate-session.use-case";
import { VerifySessionUseCase } from "@/modules/auth/application/use-cases/verify-session.use-case";
import type { TerminateSessionReason } from "@/modules/auth/domain/policies/session.policy";
import { createSessionCookieAdapter } from "@/modules/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Composition Root for Session operations.
 * Returns an object containing pre-wired session capabilities.
 */
export function createSessionServiceFactory(
  logger: LoggingClientContract,
  requestId: string,
) {
  const scopedLogger = logger.withContext("auth").withRequest(requestId);
  const sessionCookieAdapter = createSessionCookieAdapter();
  const sessionTokenAdapter = createSessionTokenAdapter();

  const deps = {
    logger: scopedLogger,
    sessionCookieAdapter,
    sessionTokenAdapter,
  };

  return {
    establish: (user: Parameters<EstablishSessionUseCase["execute"]>[0]) =>
      new EstablishSessionUseCase(deps).execute(user),
    read: () => new GetSessionUseCase(deps).execute(),
    rotate: () => new RotateSessionUseCase(deps).execute(),
    terminate: (reason: TerminateSessionReason) =>
      new TerminateSessionUseCase(deps).execute(reason),
    verify: () => new VerifySessionUseCase(deps).execute(),
  };
}
