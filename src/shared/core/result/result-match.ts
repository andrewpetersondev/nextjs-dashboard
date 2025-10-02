import type { Result } from "@/shared/core/result/result";

/** Unwrap or throw error branch. */
export const unwrapOrThrow = <T, E>(r: Result<T, E>): T => {
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/** Unwrap or return fallback constant. */
export const unwrapOr =
  <T, E>(fallback: T) =>
  (r: Result<T, E>): T =>
    r.ok ? r.value : fallback;

/** Unwrap or compute fallback from error. */
export const unwrapOrElse =
  <T, E>(fallback: (e: E) => T) =>
  (r: Result<T, E>): T =>
    r.ok ? r.value : fallback(r.error);

/** Pattern match both branches. */
export const matchResult = <T, E, U>(
  r: Result<T, E>,
  onOk: (v: T) => U,
  onErr: (e: E) => U,
): U => (r.ok ? onOk(r.value) : onErr(r.error));
