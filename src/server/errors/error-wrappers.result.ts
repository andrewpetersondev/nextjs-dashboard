import "server-only";
import { mapToRepoError, type RepoError } from "@/server/errors/mappers";
import type { Result } from "@/shared/core/result/result";
import { fromPromise } from "@/shared/core/result/result-async";

/**
 * Typed wrapper around fromPromise to infer E via mapToRepoError,
 * eliminating repetitive type casts at call sites.
 *
 * Note: We fix the error type as RepoError to avoid inference widening to `unknown`.
 */
export function promiseToRepoResult<T>(
  p: Promise<T>,
): Promise<Result<T, RepoError>> {
  return fromPromise<T, RepoError>(p, mapToRepoError);
}
