import type { Result } from "@/shared/core/result/result";

/**
 * Side-effect on success; returns the original result.
 *
 * Branch semantics: On Ok, invokes fn(data) for side effects and returns the original Ok. On Err, returns the same Err unchanged.
 *
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param fn - Callback invoked with success value.
 * @returns Unmodified input result.
 */
export const tapOk =
  <T, E>(fn: (v: T) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (r.success) {
      fn(r.data);
    }
    return r;
  };

/**
 * Side-effect on error; returns the original result.
 *
 * Branch semantics: On Err, invokes fn(error) for side effects and returns the original Err. On Ok, returns the same Ok unchanged.
 *
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param fn - Callback invoked with error value.
 * @returns Unmodified input result.
 */
export const tapError =
  <T, E>(fn: (e: E) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (!r.success) {
      fn(r.error);
    }
    return r;
  };
