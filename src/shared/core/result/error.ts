// src/shared/core/result/error.ts
/**
 * Lightweight error modeling primitives for the Result subsystem.
 * Provides a narrow, JSON‑safe `AppError` plus normalization helpers.
 */

import { IS_PROD } from "@/shared/config/env-shared";

import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { ErrorCode } from "@/shared/core/errors/base/error-codes";

/**
 * @public
 * Provides overrides for normalizing unknown errors.
 * @remarks
 * This interface allows specifying optional properties to define the kind, code, and severity of the error.
 * @property kind - An optional string to categorize the error.
 * @property code - An optional string representing a specific error code.
 * @property severity - An optional value from `AppError["severity"]` indicating the error's severity level.
 */
interface NormalizeUnknownErrorOverrides {
  readonly kind?: string;
  readonly code?: ErrorCode;
  readonly severity?: AppError["severity"];
}

// helpers to apply overrides and narrow inputs
const applyOverrides = /* @__PURE__ */ (
  base: AppError,
  overrides?: NormalizeUnknownErrorOverrides,
): AppError => {
  const out: AppError = {
    ...base,
    code: overrides?.code ?? base.code,
    kind: overrides?.kind ?? base.kind,
    severity: overrides?.severity ?? base.severity,
  };
  if (!IS_PROD) {
    Object.freeze(out);
  }
  return out;
};

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
 * Narrow unknown to ErrorLike quickly.
 */
export const isErrorLike = (e: unknown): e is ErrorLike => {
  if (typeof e !== "object" || e === null) {
    return false;
  }
  const obj = e as { readonly message?: unknown };
  return "message" in obj && typeof obj.message === "string";
};

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

/**
 * @deprecated Prefer adapter at `'/src/shared/core/errors/adapters/app-error-normalizers.ts'` (`toAppErrorFromUnknown`).
 */
export const normalizeUnknownError = /* @__PURE__ */ (
  input: unknown,
  overrides?: NormalizeUnknownErrorOverrides,
): AppError => {
  // Forward to adapter; keep optional overrides for compatibility.
  return applyOverrides(toAppErrorFromUnknown(input), overrides);
};
