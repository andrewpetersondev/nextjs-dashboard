// File: src/shared/core/result/error.ts

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
  readonly form?: Record<string, string>; // dense field map
  readonly cause?: unknown;
  readonly details?: unknown;
  readonly kind?: string;
  readonly name?: string;
  readonly severity?: "info" | "warn" | "error";
  readonly stack?: string;
}
