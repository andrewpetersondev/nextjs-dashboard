import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export async function logoutWorkflow(
  deps: Readonly<{ sessionService: SessionServiceContract }>,
): Promise<Result<void, AppError>> {
  return await deps.sessionService.terminate("user_logout");
}
