import "server-only";

import { EstablishSessionCommand } from "@/modules/auth/application/use-cases/establish-session.command";
import { GetSessionUseCase } from "@/modules/auth/application/use-cases/get-session.use-case";
import { RotateSessionCommand } from "@/modules/auth/application/use-cases/rotate-session.command";
import {
  TerminateSessionCommand,
  type TerminateSessionReason,
} from "@/modules/auth/application/use-cases/terminate-session.command";
import { VerifySessionUseCase } from "@/modules/auth/application/use-cases/verify-session.use-case";
import { createSessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import { createSessionCookieAdapter } from "@/modules/auth/infrastructure/session-store/adapters/session-cookie.adapter";
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
    establish: (user: Parameters<EstablishSessionCommand["execute"]>[0]) =>
      new EstablishSessionCommand(deps).execute(user),
    read: () => new GetSessionUseCase(deps).execute(),
    rotate: () => new RotateSessionCommand(deps).execute(),
    terminate: (reason: TerminateSessionReason) =>
      new TerminateSessionCommand(deps).execute(reason),
    verify: () => new VerifySessionUseCase(deps).execute(),
  };
}
