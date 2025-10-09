// File: src/shared/core/errors/error-adapters.ts
import { IS_PROD } from "@/shared/config/env-shared";
import { BaseError } from "@/shared/core/errors/base/base-error";
import {
  isErrorCode,
  tryGetErrorCodeMeta,
} from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/error";

// local fallback to avoid cycle on DEFAULT_UNKNOWN_MESSAGE
const FALLBACK_UNKNOWN_MESSAGE = "An unknown error occurred" as const;

// NEW: unknown → AppError via BaseError normalization (adds `kind` and `severity`)
export const toAppError = (value: unknown): AppError => {
  const b =
    value instanceof BaseError ? value : normalizeToBaseError(value, "UNKNOWN");
  const meta = tryGetErrorCodeMeta(b.code);
  const app: AppError = {
    code: b.code,
    kind: meta?.category ?? "unknown",
    message: b.message,
    severity: (meta?.severity as AppError["severity"] | undefined) ?? "error",
  };
  if (!IS_PROD) {
    Object.freeze(app);
  }
  return app;
};

// NEW: merge patch into adapted AppError (keep `code` strongly typed; freeze in dev)
export const augmentAppError = (
  base: unknown,
  patch: Readonly<Partial<AppError>> & {
    readonly message?: string;
    readonly code?: BaseError["code"];
    readonly kind?: string;
  },
): AppError => {
  const normalized = toAppError(base);
  const merged: AppError = {
    ...normalized,
    ...patch,
    code: patch.code ?? normalized.code,
    message: patch.message ?? normalized.message,
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
export function toBaseError(
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
  return {
    code,
    kind: meta?.category ?? "unknown",
    message: message || meta?.description || FALLBACK_UNKNOWN_MESSAGE,
    severity: (meta?.severity as AppError["severity"] | undefined) ?? "error",
    ...(details ? { details } : {}),
  };
}

/**
 * Lift a function that returns/throws BaseError into one returning AppError.
 * Intended for server actions or any UI boundary.
 */
export function liftToAppError<TArgs extends readonly unknown[], TOut>(
  fn: (...args: TArgs) => Promise<TOut>,
) {
  return async (...args: TArgs) => {
    try {
      const value = await fn(...args);
      return { ok: true as const, value };
    } catch (e) {
      return { error: toAppError(e), ok: false as const };
    }
  };
}
