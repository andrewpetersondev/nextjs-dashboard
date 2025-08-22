import "server-only";

import { mapToRepoError, type RepoError } from "@/server/errors/mappers";

import { fromPromise } from "@/shared/result/result-async";
import type { Result } from "@/shared/result/result-base";

/**
 * Typed wrapper around fromPromise to infer E via mapToRepoError,
 * eliminating repetitive type casts at call sites.
 *
 * Note: We fix the error type as RepoError to avoid inference widening to `unknown`.
 */
export function fromDal<T>(p: Promise<T>): Promise<Result<T, RepoError>> {
  return fromPromise<T, RepoError>(p, mapToRepoError);
}
