import "server-only";

import type { SessionService } from "@/modules/auth/server/application/services/session.service";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";

export async function logoutWorkflow(
  deps: Readonly<{ sessionService: SessionService }>,
): Promise<Result<void, AppError>> {
  return await deps.sessionService.clear();
}
