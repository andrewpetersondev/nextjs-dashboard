import "server-only";
import {
  mapToRepoError,
  type RepoError,
} from "@/server/invoices/error-mappers.server";
import { fromPromiseThunk } from "@/shared/result/async/result-async";
import type { Result } from "@/shared/result/result";

/**
 * Typed wrapper around fromPromise to infer E via mapToRepoError,
 * eliminating repetitive type casts at call sites.
 *
 * Note: We fix the error type as RepoError to avoid inference widening to `unknown`.
 */
export function promiseToRepoResult<T>(
  p: Promise<T>,
): Promise<Result<T, RepoError>> {
  //@ts-expect-error
  return fromPromiseThunk<T, RepoError>(p, mapToRepoError);
}
