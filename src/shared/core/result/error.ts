// src/shared/core/result/error.ts
/**
 * Lightweight error modeling primitives for the Result subsystem.
 * Provides a narrow, JSON‑safe `AppError` plus normalization helpers.
 */

import { IS_PROD } from "@/shared/config/env-shared";
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

/**
 * Represents a type for partially updating `AppError` objects while optionally overriding `kind` and `message`.
 *
 * @typeParam AppError - The base error object to be augmented.
 * @public
 * @example
 * const errorPatch: AugmentAppErrorPatch = { kind: "ValidationError", code: 400 };
 */
type AugmentAppErrorPatch = Partial<Omit<AppError, "kind" | "message">> & {
  readonly kind?: string;
  readonly message?: string;
};

/**
 * Determines if a given value conforms to the `AppError` type.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is an `AppError`, otherwise `false`.
 * @example
 * ```ts
 * isAppError({ kind: 'ErrorType', message: 'An error occurred' }); // true
 * isAppError({ type: 'ErrorType' }); // false
 * ```
 * @see AppError
 */
const isAppError = (value: unknown): value is AppError =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  typeof (value as { kind: unknown }).kind === "string" &&
  "message" in value &&
  typeof (value as { message: unknown }).message === "string";

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

const isPlainMessageObject = /* @__PURE__ */ (
  value: unknown,
): value is { readonly message: string } => {
  if (typeof value !== "object" || value === null || value instanceof Error) {
    return false;
  }
  const obj = value as { readonly message?: unknown };
  return "message" in obj && typeof obj.message === "string";
};

const fromErrorInstance = /* @__PURE__ */ (
  input: Error,
  overrides?: NormalizeUnknownErrorOverrides,
): AppError =>
  applyOverrides(
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cause: (input as any).cause,
      code: undefined,
      kind: DEFAULT_UNKNOWN_KIND,
      message: input.message || DEFAULT_UNKNOWN_MESSAGE,
      name: input.name,
      severity: DEFAULT_UNKNOWN_SEVERITY,
      stack: input.stack,
    },
    overrides,
  );

const fromMessageObject = /* @__PURE__ */ (
  input: { readonly message: string },
  overrides?: NormalizeUnknownErrorOverrides,
): AppError =>
  applyOverrides(
    {
      code: undefined,
      kind: DEFAULT_UNKNOWN_KIND,
      message: input.message || DEFAULT_UNKNOWN_MESSAGE,
      severity: DEFAULT_UNKNOWN_SEVERITY,
    },
    overrides,
  );

const fromFallback = /* @__PURE__ */ (
  input: unknown,
  overrides?: NormalizeUnknownErrorOverrides,
): AppError =>
  applyOverrides(
    {
      code: undefined,
      kind: DEFAULT_UNKNOWN_KIND,
      message:
        typeof input === "string" && input.trim().length > 0
          ? input
          : DEFAULT_UNKNOWN_MESSAGE,
      severity: DEFAULT_UNKNOWN_SEVERITY,
    },
    overrides,
  );

/**
 * Represents the default value for an unknown kind.
 *
 * @defaultValue "unknown"
 * @readonly
 * @public
 */
export const DEFAULT_UNKNOWN_KIND = "unknown" as const;
/**
 * Default message displayed for unknown errors.
 *
 * @defaultValue "An unknown error occurred"
 * @public
 */
export const DEFAULT_UNKNOWN_MESSAGE = "An unknown error occurred" as const;
/**
 * @readonly
 * @defaultValue "error"
 * @remarks Represents the default severity level assigned when the severity is unknown.
 */
export const DEFAULT_UNKNOWN_SEVERITY: AppError["severity"] = "error";

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
  readonly kind: string;
  readonly message: string;
  readonly code?: ErrorCode;
  readonly details?: unknown;
  readonly severity?: "info" | "warn" | "error";
  readonly name?: string;
  readonly stack?: string;
  readonly cause?: unknown;
}

/**
 * Normalizes an unknown input into a standardized `AppError` object.
 *
 * @param input - The input to normalize, which can be of any type.
 * @param overrides - Optional overrides to adjust the error's properties.
 * @returns A normalized `AppError` with consistent structure and default values.
 * @example
 * const error = normalizeUnknownError(new Error("Sample error"));
 * @public
 * @deprecated Prefer adapter at `'/src/shared/core/errors/adapters/app-error-adapters.ts'` (`toAppError`).
 */
export const normalizeUnknownError = /* @__PURE__ */ (
  input: unknown,
  overrides?: NormalizeUnknownErrorOverrides,
): AppError => {
  if (isAppError(input)) {
    return applyOverrides(input, overrides);
  }
  if (input instanceof Error) {
    return fromErrorInstance(input, overrides);
  }
  if (isPlainMessageObject(input)) {
    return fromMessageObject(input, overrides);
  }
  return fromFallback(input, overrides);
};

/**
 * Enhances a base error object with additional patch data to create an `AppError`.
 *
 * @param base - The base error object, which can be of any type.
 * @param patch - Partial properties used to augment the base error.
 * @returns The normalized and augmented `AppError`.
 * @example
 * const error = augmentAppError(someError, { message: 'Custom Message', kind: 'TypeA' });
 * @public
 * @deprecated Prefer adapter at `'/src/shared/core/errors/adapters/app-error-adapters.ts'` (`augmentAppError`).
 */
export const augmentAppError = /* @__PURE__ */ (
  base: unknown,
  patch: AugmentAppErrorPatch,
): AppError => {
  const normalized = normalizeUnknownError(base);
  const out: AppError = {
    ...normalized,
    ...patch,
    kind: patch.kind ?? normalized.kind,
    message: patch.message ?? normalized.message,
  };
  if (!IS_PROD) {
    Object.freeze(out);
  }
  return out;
};
