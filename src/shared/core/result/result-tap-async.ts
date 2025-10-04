// File: src/shared/core/result/result-tap-async.ts
import type { ErrorLike } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";

/**
 * Async side-effect on success branch.
 * @template TValue
 * @template TError
 * @param fn Async consumer.
 */
export const tapOkAsync =
  <TValue, TError extends ErrorLike>(fn: (v: TValue) => Promise<void>) =>
  async (r: Result<TValue, TError>): Promise<Result<TValue, TError>> => {
    if (r.ok) {
      await fn(r.value);
    }
    return r;
  };
