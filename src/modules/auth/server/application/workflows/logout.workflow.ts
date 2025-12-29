import "server-only";

import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/results/result.types";

export async function logoutWorkflow(
  deps: Readonly<{ sessionService: SessionService }>,
): Promise<Result<void, AppError>> {
  return await deps.sessionService.terminate();
}
