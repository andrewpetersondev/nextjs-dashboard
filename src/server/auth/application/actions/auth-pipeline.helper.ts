// src/server/auth/application/actions/auth-pipeline.helper.ts

import "server-only";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { pipeAsync } from "@/shared/core/result/async/result-pipe-async";
import { flatMapAsync } from "@/shared/core/result/async/result-transform-async";
import { Ok, type Result } from "@/shared/core/result/result";
import { establishSessionAction } from "./establish-session.action";

/**
 * Executes the authentication pipeline:
 * seeds the pipeline with `input`, runs `authHandler` to authenticate/authorize the user,
 * then runs `establishSessionAction` to create a session for the authenticated user.
 *
 * @typeParam T - Type of the pipeline input.
 * @param input - Arbitrary data passed into `authHandler`.
 * @param authHandler - Async handler that maps `input` to a `Result` containing the
 * authenticated user `{ id, role }` or an `AppError`.
 * @returns A `Promise` resolving to the pipeline's `Result`. On success it contains the
 * authenticated user `{ id, role }`; on failure it contains an `AppError`.
 */
export async function executeAuthPipeline<T>(
  input: T,
  authHandler: (data: T) => Promise<Result<SessionUser, AppError>>,
): Promise<Result<SessionUser, AppError>> {
  const seed = Ok(input);
  const auth = flatMapAsync(authHandler);
  const establishSession = flatMapAsync(establishSessionAction);

  return await pipeAsync(seed, auth, establishSession);
}
