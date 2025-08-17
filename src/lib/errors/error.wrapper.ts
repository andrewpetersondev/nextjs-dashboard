import "server-only";

import { fromPromise, type Result } from "@/lib/core/result";
import { mapToRepoError, type RepoError } from "@/lib/errors/error.mapper";

/**
 * Typed wrapper around fromPromise to infer E via mapToRepoError,
 * eliminating repetitive type casts at call sites.
 *
 * Note: We fix the error type as RepoError to avoid inference widening to `unknown`.
 */
export function fromDal<T>(p: Promise<T>): Promise<Result<T, RepoError>> {
  return fromPromise<T, RepoError>(p, mapToRepoError);
}
