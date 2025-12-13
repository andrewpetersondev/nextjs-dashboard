import "server-only";

import type { UpdateSessionOutcome } from "@/modules/auth/domain/session/session-payload.types";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

/**
 * Refreshes (rotates) the current session token if needed.
 *
 * Policy outcomes are returned as values (`Ok(outcome)`).
 * Operational failures are returned as `Err(AppError)`.
 */
export async function refreshSessionWorkflow(
  deps: Readonly<{ sessionService: SessionService }>,
): Promise<Result<UpdateSessionOutcome, AppError>> {
  return await deps.sessionService.rotate();
}
