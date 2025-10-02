import { Err, Ok, type Result } from "@/shared/core/result/result";

/** Map success value if Ok; pass through if Err. */
export const mapOk =
  <T, U, E>(fn: (v: T) => U) =>
  (r: Result<T, E>): Result<U, E> =>
    r.ok ? Ok(fn(r.value)) : r;

/** Map error value if Err; pass through if Ok. */
export const mapError =
  <T, E1, E2>(fn: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<T, E2> =>
    r.ok ? r : Err(fn(r.error));

/** Map both branches. */
export const mapBoth =
  <T, U, E1, E2>(onOk: (v: T) => U, onErr: (e: E1) => E2) =>
  (r: Result<T, E1>): Result<U, E2> =>
    r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
