import "server-only";
import { mapDrizzleToDalError } from "@/server/errors/drizzle";
import { mapToRepoError, type RepoError } from "@/server/errors/mappers";
import { fromPromise } from "@/shared/core/result/result-async";
import type { Result } from "@/shared/core/result/result-base";

/**
 * Typed wrapper around fromPromise to infer E via mapToRepoError,
 * eliminating repetitive type casts at call sites.
 *
 * Note: We fix the error type as RepoError to avoid inference widening to `unknown`.
 */
export function fromDal<T>(p: Promise<T>): Promise<Result<T, RepoError>> {
  return fromPromise<T, RepoError>(p, mapToRepoError);
}

/**
 * Execute a DAL operation and rethrow mapped errors (throwing style).
 * - Maps Drizzle/unknown errors to domain-safe errors via mapDrizzleToDalError.
 * - Keeps throwing semantics for services/actions that don't use Result<T, E>.
 */
export async function dalTry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw mapDrizzleToDalError(e);
  }
}
