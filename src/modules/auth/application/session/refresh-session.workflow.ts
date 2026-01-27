import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";

import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Refreshes (rotates) the current session token if possible.
 *
 * This workflow delegates to the session service to perform token rotation.
 * It returns the outcome of the rotation attempt, which could indicate that
 * the session was refreshed, or that it was not (e.g., if it was already fresh).
 *
 * @param deps - Workflow dependencies (session service).
 * @returns A Result containing the update session outcome or an AppError.
 */
export async function refreshSessionWorkflow(
  deps: Readonly<{ sessionService: SessionServiceContract }>,
): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
  return await deps.sessionService.rotate();
}
