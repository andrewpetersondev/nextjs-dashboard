// src/server/auth/application/actions/auth-pipeline.helper.ts

import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { pipeAsync } from "@/shared/core/result/async/result-pipe-async";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok, type Result } from "@/shared/core/result/result";
import type { UserId } from "@/shared/domain/domain-brands";
import { establishSessionAction } from "./establish-session.action";

export async function executeAuthPipeline<T>(
  input: T,
  authHandler: (
    data: T,
  ) => Promise<Result<{ id: UserId; role: UserRole }, AppError>>,
) {
  const seed = Ok(input);
  const auth = flatMapAsync(authHandler);
  const establishSession = flatMapAsync(establishSessionAction);

  return await pipeAsync(seed, auth, establishSession);
}
