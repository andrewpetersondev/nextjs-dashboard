/**
 * Canonical Result discriminated union.
 * Use `ok` flag only for branching; never rely on presence checks.
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Construct a successful Result. */
export const Ok = <T, E = never>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

/** Construct a failed Result. */
export const Err = <T = never, E = unknown>(error: E): Result<T, E> => ({
  error,
  ok: false,
});

/**
 * Legacy (pre-refactor) shape kept for transitional compatibility.
 * @deprecated Use `Result<T,E>` (`ok/value`) instead of `success/data`.
 */
export type LegacyResult<T, E> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Adapter: canonical → legacy.
 * @deprecated Prefer using canonical shape directly.
 */
export const toLegacy = <T, E>(r: Result<T, E>): LegacyResult<T, E> =>
  r.ok ? { data: r.value, success: true } : { error: r.error, success: false };

/**
 * Adapter: legacy → canonical.
 * @deprecated Migrate callers to produce canonical directly.
 */
export const fromLegacy = <T, E>(r: LegacyResult<T, E>): Result<T, E> =>
  r.success ? { ok: true, value: r.data } : { error: r.error, ok: false };

/** Type guard: Ok branch. */
export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; value: T } =>
  r.ok;
/** Type guard: Err branch. */
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } =>
  !r.ok;
