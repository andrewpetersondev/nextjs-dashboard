// File: src/shared/core/result/app-error.ts

import type { ErrorCode, Severity } from "@/shared/core/errors/error-codes";

/**
 * Build a mapper unknown -> TError with a type guard and fallback constructor.
 * Keeps fromPromiseWith generic while guaranteeing a TError.
 */
export const makeErrorMapper =
  /* @__PURE__ */
    <Terror extends AppError>(opts: {
      readonly isTarget: (e: unknown) => e is Terror;
      readonly toTarget: (e: unknown) => Terror;
      readonly fallback?: (e: unknown) => Terror;
    }) =>
    /* @__PURE__ */
    (e: unknown): Terror =>
      opts.isTarget(e) ? e : (opts.fallback ?? opts.toTarget)(e);

/**
 * Canonical, JSON-safe details payload for AppError.
 * - Brand enforces construction via builders/normalizers.
 * JSON-safe diagnostics and UI payloads.
 *
 * Forms: normalized, framework-agnostic shape.
 * - formErrors: readonly array of non-field messages (may be empty).
 * - fieldErrors: dense map field -> readonly string[] (may be empty arrays).
 */
export interface AppErrorDetails {
  readonly formErrors?: readonly string[];
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  /** Extensible bag for adapter-safe, JSON-serializable extras */
  readonly extra?: Readonly<Record<string, unknown>>;
  /** Nominal brand to discourage ad-hoc object assignment */
  readonly __brand?: "AppErrorDetails";
}

/**
 * Represents an application-level error with structured information.
 *
 * @public
 * @readonly
 * @remarks Provides clarity on the context and severity of an error.
 * @example
 * ```
 * const error: AppError = {
 *   kind: "ValidationError",
 *   message: "Invalid input provided",
 *   severity: "error"
 * };
 * ```
 */
export interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
  /**
   * Canonical, JSON-safe diagnostics payload shared across boundaries.
   * See AppErrorDetails.
   */
  readonly details?: AppErrorDetails;
  readonly kind?: string;
  readonly name?: string;
  readonly severity?: Severity;
  readonly stack?: string;
  readonly __appError?: "AppError";
}

// Factory helpers (kept minimal here to avoid cyclic deps with builders)

/** Create branded details; call sites can pass partials safely. */
export const makeAppErrorDetails = (
  d: Readonly<{
    formErrors?: readonly string[];
    fieldErrors?: Readonly<Record<string, readonly string[]>>;
    extra?: Readonly<Record<string, unknown>>;
  }>,
): AppErrorDetails => {
  const details: AppErrorDetails = {
    ...(d.formErrors ? { formErrors: d.formErrors } : {}),
    ...(d.fieldErrors ? { fieldErrors: d.fieldErrors } : {}),
    ...(d.extra ? { extra: d.extra } : {}),
    __brand: "AppErrorDetails",
  };
  return Object.freeze(details);
};

// Type guard to validate external details before attaching to AppError
export function isAppErrorDetails(v: unknown): v is AppErrorDetails {
  if (typeof v !== "object" || v === null) {
    return false;
  }
  const obj = v as Record<string, unknown>;
  const fe = obj.fieldErrors;
  const ff = obj.formErrors;
  const extra = obj.extra;
  const brandOk =
    obj.__brand === "AppErrorDetails" || obj.__brand === undefined;
  const formOk =
    ff === undefined ||
    (Array.isArray(ff) && ff.every((x) => typeof x === "string"));
  const fieldsOk =
    fe === undefined ||
    (typeof fe === "object" &&
      fe !== null &&
      Object.values(fe as Record<string, unknown[]>).every(
        (arr) => Array.isArray(arr) && arr.every((x) => typeof x === "string"),
      ));
  const extraOk =
    extra === undefined || (typeof extra === "object" && extra !== null); // JSON-safety is enforced by producers
  return brandOk && formOk && fieldsOk && extraOk;
}
