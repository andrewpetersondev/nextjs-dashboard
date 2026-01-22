import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";

import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

/**
 * Refreshes (rotates) the current session token if needed.
 *
 * Policy outcomes are returned as values (`Ok(outcome)`).
 * Operational failures are returned as `Err(AppError)`.
 */
export async function refreshSessionWorkflow(
  deps: Readonly<{ sessionService: SessionServiceContract }>,
): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
  return await deps.sessionService.rotate();
}
