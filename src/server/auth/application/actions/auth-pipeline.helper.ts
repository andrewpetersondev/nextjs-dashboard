// src/server/auth/application/actions/auth-pipeline.helper.ts

import "server-only";
import type { SessionUser } from "@/features/auth/domain/sessions/session-action.types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { pipeAsync } from "@/shared/result/async/result-pipe-async";
import { flatMapAsync } from "@/shared/result/async/result-transform-async";
import { Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";
import { establishSessionAction } from "./establish-session.action";

// Memoized wrapper functions to avoid creating new instances on every call
const memoizedEstablishSession = flatMapAsync(establishSessionAction);

/**
 * Execute the authentication pipeline: seed the pipeline with `input`, run
 * `authHandler` to authenticate/authorize the user, then run
 * `establishSessionAction` to create a session for the authenticated user.
 *
 * @typeParam T - Type of the pipeline input.
 * @param input - Arbitrary data passed into `authHandler`.
 * @param authHandler - Async handler that maps `input` to a `Result` containing the
 * authenticated user (`SessionUser`) or an `AppError`.
 * @returns A `Promise` resolving to the pipeline `Result`. On success it contains
 * the authenticated `SessionUser`; on failure it contains an `AppError`.
 */
export async function executeAuthPipeline<T>(
  input: T,
  authHandler: (data: T) => Promise<Result<SessionUser, AppError>>,
): Promise<Result<SessionUser, AppError>> {
  const seed = Ok(input);
  const auth = flatMapAsync(authHandler);

  return await pipeAsync(seed, auth, memoizedEstablishSession);
}
