import "server-only";

import { EstablishSessionCommand } from "@/modules/auth/application/use-cases/commands/establish-session.command";
import { RotateSessionCommand } from "@/modules/auth/application/use-cases/commands/rotate-session.command";
import {
  TerminateSessionCommand,
  type TerminateSessionReason,
} from "@/modules/auth/application/use-cases/commands/terminate-session.command";
import { GetSessionQuery } from "@/modules/auth/application/use-cases/queries/get-session.query";
import { VerifySessionQuery } from "@/modules/auth/application/use-cases/queries/verify-session.query";
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
  // todo: rename store
  const store = createSessionCookieAdapter();
  // todo: rename tokenService
  const tokenService = createSessionTokenAdapter();

  const deps = { logger: scopedLogger, store, tokenService };

  return {
    establish: (user: Parameters<EstablishSessionCommand["execute"]>[0]) =>
      new EstablishSessionCommand(deps).execute(user),
    read: () => new GetSessionQuery(deps).execute(),
    rotate: () => new RotateSessionCommand(deps).execute(),
    terminate: (reason: TerminateSessionReason) =>
      new TerminateSessionCommand(deps).execute(reason),
    verify: () => new VerifySessionQuery(deps).execute(),
  };
}
