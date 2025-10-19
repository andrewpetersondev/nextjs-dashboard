// File: src/shared/core/result/app-error.ts

import type { ErrorCode } from "@/shared/core/errors/base/error-codes";

/**
 * Represents an error-like object with a `message` property.
 *
 * @public
 * @remarks This type can be used to handle both standard `Error` objects and custom objects with a `message` field.
 * @example
 * ```ts
 * const error1: ErrorLike = new Error("Standard error");
 * const error2: ErrorLike = { message: "Custom error" };
 * ```
 */
export type ErrorLike = Error | { readonly message: string };

/**
 * Build a mapper unknown -> TError with a type guard and fallback constructor.
 * Keeps fromPromiseWith generic while guaranteeing a TError.
 */
export const makeErrorMapper =
  /* @__PURE__ */
    <TError extends ErrorLike>(opts: {
      readonly isTarget: (e: unknown) => e is TError;
      readonly toTarget: (e: unknown) => TError;
      readonly fallback?: (e: unknown) => TError;
    }) =>
    /* @__PURE__ */
    (e: unknown): TError =>
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
  readonly details?: AppErrorDetails | unknown;
  readonly kind?: string;
  readonly name?: string;
  readonly severity?: "info" | "warn" | "error";
  readonly stack?: string;
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
