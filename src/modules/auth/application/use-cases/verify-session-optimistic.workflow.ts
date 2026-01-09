import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionTransport } from "@/modules/auth/infrastructure/serialization/session.transport";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Optimistically verifies the current session (cookie/JWT based).
 *
 * Framework-agnostic workflow that delegates to SessionService.
 */
export async function verifySessionOptimisticWorkflow(
  deps: Readonly<{
    sessionService: SessionServiceContract;
  }>,
): Promise<Result<SessionTransport, AppError>> {
  return await deps.sessionService.verify();
}
