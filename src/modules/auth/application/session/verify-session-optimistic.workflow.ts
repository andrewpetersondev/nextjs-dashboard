import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Optimistically verifies the current session (cookie/JWT based).
 *
 * This framework-agnostic workflow delegates to the session service to
 * quickly verify the session token without necessarily performing
 * expensive backend checks (unless required by the service implementation).
 *
 * @param deps - Workflow dependencies (session service).
 * @returns A Result containing the session verification DTO or an AppError.
 */
export async function verifySessionOptimisticWorkflow(
  deps: Readonly<{
    sessionService: SessionServiceContract;
  }>,
): Promise<Result<SessionVerificationDto, AppError>> {
  return await deps.sessionService.verify();
}
