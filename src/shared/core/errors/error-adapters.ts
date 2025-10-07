// src/shared/core/errors/error-adapters.ts
import { BaseError } from "@/shared/core/errors/base-error";
import {
  isErrorCode,
  tryGetErrorCodeMeta,
} from "@/shared/core/errors/error-codes";
import {
  type AppError,
  augmentAppError,
  DEFAULT_UNKNOWN_MESSAGE,
  normalizeUnknownError,
} from "@/shared/core/result/error";

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

/**
 * Merge additional presentation data into an AppError (non-destructive).
 * Shorthand around augmentAppError.
 */
export const withAppErrorPatch = (
  e: unknown,
  patch: Partial<Omit<AppError, "message" | "kind">> & {
    readonly message?: string;
    readonly kind?: string;
  },
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
    message: message || meta?.description || DEFAULT_UNKNOWN_MESSAGE,
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
): (
  ...args: TArgs
) => Promise<{ ok: true; value: TOut } | { ok: false; error: AppError }> {
  return async (...args: TArgs) => {
    try {
      const value = await fn(...args);
      return { ok: true as const, value };
    } catch (e) {
      return { error: normalizeUnknownError(e), ok: false as const };
    }
  };
}
