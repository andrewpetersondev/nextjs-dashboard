import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Run fn and wrap result or thrown error in Result.
 * Branch semantics: If fn returns, returns Ok(value). If fn throws, returns Err(mapped or cast error).
 * @typeParam T - Success type.
 * @typeParam E - Error type (default `Error`).
 * @param fn - Synchronous function to execute.
 * @param mapError - Optional mapper for unknown error.
 * @returns Ok(fn()) or Err(mapped error).
 */
export const tryCatch = <T, E = Error>(
  fn: () => T,
  mapError?: (e: unknown) => E,
): Result<T, E> => {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as E));
  }
};

/**
 * Wrap nullable value into Result.
 * Branch semantics: If value is not null/undefined, returns Ok(value). Otherwise, returns Err(onNull()).
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @param v - Value that may be null/undefined.
 * @param onNull - Error factory when value is nullish.
 * @returns Ok(v) if defined; otherwise Err(onNull()).
 */
export const fromNullable = <T, E>(
  v: T | null | undefined,
  onNull: () => E,
): Result<T, E> => (v == null ? Err(onNull()) : Ok(v));
