import "server-only";

import type { SessionAdapterContract } from "@/modules/auth/application/contracts/session-adapter.contract";
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
    sessionService: SessionAdapterContract;
  }>,
): Promise<Result<SessionTransport, AppError>> {
  return await deps.sessionService.verify();
}
