// File: 'src/shared/core/errors/adapters/app-error-adapters.ts'
import { IS_PROD } from "@/shared/config/env-shared";
import { BaseError } from "@/shared/core/errors/base/base-error";
import {
  isErrorCode,
  tryGetErrorCodeMeta,
} from "@/shared/core/errors/base/error-codes";
import { DEFAULT_UNKNOWN_MESSAGE } from "@/shared/core/result/app-error.constants";
import type { AppError } from "@/shared/core/result/error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

// + local dev-freeze helper and builders to reduce branching
const freezeDev = <TObj extends object>(obj: TObj): TObj => {
  if (!IS_PROD) {
    Object.freeze(obj);
  }
  return obj;
};

// Add helper: narrow unknown to AppError["severity"]
const toSeverity = (s: unknown): AppError["severity"] | undefined =>
  s === "info" || s === "warn" || s === "error" ? s : undefined;

// Replace mutable builder to avoid assigning to readonly fields
const pickOptionalFromLike = (
  v: Partial<AppError>,
): Readonly<Partial<AppError>> => {
  const maybeForm = v.form && isStringRecord(v.form) ? { form: v.form } : {};
  const maybeDetails = v.details !== undefined ? { details: v.details } : {};
  const maybeCause = v.cause !== undefined ? { cause: v.cause } : {};
  const maybeName = v.name ? { name: v.name } : {};
  const maybeStack = v.stack ? { stack: v.stack } : {};
  return {
    ...maybeForm,
    ...maybeDetails,
    ...maybeCause,
    ...maybeName,
    ...maybeStack,
  };
};

// Use toSeverity() instead of non‑primitive cast
const fromAppErrorLike = (
  value: Pick<AppError, "code" | "message"> & Partial<AppError>,
): AppError => {
  const code = isErrorCode(value.code) ? value.code : "UNKNOWN";
  const meta = tryGetErrorCodeMeta(code);
  return freezeDev({
    code,
    kind: value.kind ?? meta?.category ?? "unknown",
    message: value.message,
    severity: value.severity ?? toSeverity(meta?.severity) ?? "error",
    ...pickOptionalFromLike(value),
  });
};

// Use toSeverity() instead of non‑primitive cast
const fromBaseOrUnknown = (value: unknown): AppError => {
  const b =
    value instanceof BaseError ? value : normalizeToBaseError(value, "UNKNOWN");
  const meta = tryGetErrorCodeMeta(b.code);
  return freezeDev({
    code: b.code,
    kind: meta?.category ?? "unknown",
    message: b.message,
    severity: toSeverity(meta?.severity) ?? "error",
  });
};

const isStringRecord = (o: unknown): o is Record<string, string> => {
  if (typeof o !== "object" || o === null) {
    return false;
  }
  for (const v of Object.values(o as Record<string, unknown>)) {
    if (typeof v !== "string") {
      return false;
    }
  }
  return true;
};

const isAppErrorLike = (
  v: unknown,
): v is Pick<AppError, "code" | "message"> & Partial<AppError> => {
  if (typeof v !== "object" || v === null) {
    return false;
  }
  const obj = v as { readonly code?: unknown; readonly message?: unknown };
  return typeof obj.code === "string" && typeof obj.message === "string";
};

// refactor: dispatch to small helpers to lower cognitive complexity
export const toAppErrorFromUnknown = (value: unknown): AppError => {
  return isAppErrorLike(value)
    ? fromAppErrorLike(value)
    : fromBaseOrUnknown(value);
};

// Refactor augmentAppError: simpler control flow and variables to reduce complexity
export const augmentAppError = (
  base: unknown,
  patch: Readonly<Partial<AppError>> & {
    readonly message?: string;
    readonly code?: BaseError["code"];
    readonly kind?: string;
  },
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <16 of 15>
): AppError => {
  const normalized = toAppErrorFromUnknown(base);

  const candidate = patch.code ?? normalized.code;
  const code = isErrorCode(candidate) ? candidate : normalized.code;
  const meta = tryGetErrorCodeMeta(code);

  const message = patch.message ?? normalized.message;
  const kind = patch.kind ?? normalized.kind ?? meta?.category ?? "unknown";
  const severity: AppError["severity"] =
    patch.severity ??
    normalized.severity ??
    toSeverity(meta?.severity) ??
    "error";

  const form = patch.form ?? normalized.form;
  const details =
    patch.details !== undefined ? patch.details : normalized.details;
  const cause = patch.cause !== undefined ? patch.cause : normalized.cause;
  const name = patch.name ?? normalized.name;
  const stack = patch.stack ?? normalized.stack;

  const merged: AppError = {
    code,
    kind,
    message,
    severity,
    ...(form ? { form } : {}),
    ...(details !== undefined ? { details } : {}),
    ...(cause !== undefined ? { cause } : {}),
    ...(name ? { name } : {}),
    ...(stack ? { stack } : {}),
  };

  if (!IS_PROD) {
    Object.freeze(merged);
  }
  return merged;
};

/**
 * Convert AppError back to a BaseError for server-side logging/flows.
 * - Uses provided defaultCode when AppError.code is absent/unknown.
 * - Maps kind -> category when code does not exist in registry.
 */
export function toBaseErrorFromApp(
  appError: AppError,
  defaultCode: BaseError["code"] = "UNKNOWN",
): BaseError {
  const code =
    appError.code && isErrorCode(appError.code) ? appError.code : defaultCode;

  const be = new BaseError(
    code,
    appError.message,
    // Preserve minimal, JSON-safe details as context
    {
      kind: appError.kind,
      ...(appError.form ? { form: appError.form } : {}),
      ...(appError.details ? { details: appError.details } : {}),
      ...(appError.name ? { name: appError.name } : {}),
    },
    // Keep the opaque cause reference if present
    appError.cause,
  );

  return be;
}

/**
 * Map unknown → BaseError with a chosen canonical code.
 * Useful in repositories/services to avoid throwing raw Errors.
 */
export const normalizeToBaseError = (
  e: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
  context: Readonly<Record<string, unknown>> = {},
): BaseError => {
  if (e instanceof BaseError) {
    return e;
  }
  if (e instanceof Error) {
    return new BaseError(fallbackCode, e.message, { ...context }, e);
  }
  return BaseError.from(e, fallbackCode, { ...context });
};

// Alias to match docs; forwards to `normalizeToBaseError`
export function toBaseErrorFromUnknown(
  e: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
  context: Readonly<Record<string, unknown>> = {},
): BaseError {
  return normalizeToBaseError(e, fallbackCode, context);
}

// Tighten `patch` typing so `code` matches `ErrorCode`
export const withAppErrorPatch = (
  e: unknown,
  patch: Readonly<
    Partial<Omit<AppError, "message" | "kind" | "code">> & {
      readonly message?: string;
      readonly kind?: string;
      readonly code?: BaseError["code"];
    }
  >,
): AppError => augmentAppError(e, patch);

/**
 * Create an AppError for a specific canonical code using BaseError semantics,
 * then adapt to AppError. Useful when you know the code at the boundary.
 */
export function appErrorFromCode(
  code: BaseError["code"],
  message?: string,
  details?: unknown,
): AppError {
  const meta = tryGetErrorCodeMeta(code);
  const app: AppError = {
    code,
    kind: meta?.category ?? "unknown",
    message: message || meta?.description || DEFAULT_UNKNOWN_MESSAGE,
    severity: (meta?.severity as AppError["severity"] | undefined) ?? "error",
    ...(details ? { details } : {}),
  };
  if (!IS_PROD) {
    Object.freeze(app);
  }
  return app;
}

/**
 * Lift a function that returns/throws BaseError into one returning AppError.
 * Intended for server actions or any UI boundary.
 */
export function liftToAppError<TArgs extends readonly unknown[], TOut>(
  fn: (...args: TArgs) => Promise<TOut>,
): (...args: TArgs) => Promise<Result<TOut, AppError>> {
  return async (...args: TArgs): Promise<Result<TOut, AppError>> => {
    try {
      return Ok(await fn(...args));
    } catch (e) {
      return Err(toAppErrorFromUnknown(e));
    }
  };
}
