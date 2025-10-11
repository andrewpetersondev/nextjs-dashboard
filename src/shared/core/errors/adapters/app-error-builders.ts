// File: 'src/shared/core/errors/adapters/app-error-builders.ts'
// Builders, augmentation, lifting, and BaseError <-> AppError conversions

import { IS_PROD } from "@/shared/config/env-shared";
import { toSeverity } from "@/shared/core/errors/adapters/app-error-internal";
import { toAppErrorFromUnknown } from "@/shared/core/errors/adapters/app-error-normalizers";
import type { BaseError } from "@/shared/core/errors/base/base-error";
import {
  isErrorCode,
  tryGetErrorCodeMeta,
} from "@/shared/core/errors/base/error-codes";
import { DEFAULT_UNKNOWN_MESSAGE } from "@/shared/core/result/app-error.constants";
import type { AppError } from "@/shared/core/result/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";

export const augmentAppError = (
  base: unknown,
  patch: Readonly<Partial<AppError>> & {
    readonly message?: string;
    readonly code?: BaseError["code"];
    readonly kind?: string;
  },
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
