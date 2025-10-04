// File: src/shared/core/result/result-map-async.ts

import type { AppError, ErrorLike } from "@/shared/core/result/error";
import { Ok, type Result } from "@/shared/core/result/result";

/**
 * Async map success branch.
 * @template TValue
 * @template TNext
 * @template TError
 */
export const mapOkAsync =
  <TValue, TNext, TError extends ErrorLike = AppError>(
    fn: (v: TValue) => Promise<TNext>,
  ) =>
  async (r: Result<TValue, TError>): Promise<Result<TNext, TError>> =>
    r.ok ? Ok(await fn(r.value)) : r;

/**
 * (Optional future) async mapError can mirror sync variant if needed.
 */
