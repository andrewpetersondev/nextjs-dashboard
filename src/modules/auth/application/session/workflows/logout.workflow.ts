import "server-only";
import type { SessionServiceContract } from "@/modules/auth/application/session/contracts/session-service.contract";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";

/**
 * Orchestrates the logout process.
 *
 * This workflow terminates the current user session with a "user_logout" reason.
 *
 * @param deps - Workflow dependencies (session service).
 * @returns A Result indicating success or an AppError.
 */
export async function logoutWorkflow(
  deps: Readonly<{ sessionService: SessionServiceContract }>,
): Promise<Result<void, AppError>> {
  return await deps.sessionService.terminate("logout");
}
