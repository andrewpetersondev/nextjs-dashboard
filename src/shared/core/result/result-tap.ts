import type { Result } from "@/shared/core/result/result";

/**
 * Side-effect on success; returns the original result unchanged.
 * On Ok invokes fn(value); on Err no-op.
 * @template T Success type.
 * @template E Error type.
 * @param fn Side-effect consumer for the Ok value.
 */
export const tapOk =
  <T, E>(fn: (v: T) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (r.ok) {
      fn(r.value);
    }
    return r;
  };

/**
 * Side-effect on error; returns the original result unchanged.
 * On Err invokes fn(error); on Ok no-op.
 * @template T Success type.
 * @template E Error type.
 * @param fn Side-effect consumer for the Err value.
 */
export const tapError =
  <T, E>(fn: (e: E) => void) =>
  (r: Result<T, E>): Result<T, E> => {
    if (!r.ok) {
      fn(r.error);
    }
    return r;
  };
