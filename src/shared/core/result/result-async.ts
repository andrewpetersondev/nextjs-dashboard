import { Err, Ok, type Result } from "@/shared/core/result/result";

/** Try/catch an async thunk into Result. */
export const tryCatchAsync = async <T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
  try {
    const value = await fn();
    return Ok(value);
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as E));
  }
};

/** Wrap a Promise into Result. */
export const fromPromise = async <T, E = Error>(
  p: Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
  try {
    return Ok(await p);
  } catch (e) {
    return Err(mapError ? mapError(e) : (e as E));
  }
};

/** Wrap async function (alias of tryCatchAsync). */
export const fromPromiseFn = <T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => tryCatchAsync(fn, mapError);

/** Convert Result to Promise (reject on Err). */
export const toPromise = <T, E>(r: Result<T, E>): Promise<T> =>
  r.ok ? Promise.resolve(r.value) : Promise.reject(r.error);
