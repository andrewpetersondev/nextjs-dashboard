// File: 'src/shared/core/errors/adapters/app-error-normalizers.ts'
// Normalizers and adapters between unknown/BaseError/AppError

import {
  freezeDev,
  isAppErrorLike,
  pickOptionalFromLike,
  toSeverity,
} from "@/shared/core/errors/adapters/app-error-internal";
import { BaseError } from "@/shared/core/errors/base/base-error";
import {
  isErrorCode,
  tryGetErrorCodeMeta,
} from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/app-error";

export const fromAppErrorLike = (
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

export const fromBaseOrUnknown = (value: unknown): AppError => {
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

export const toAppErrorFromUnknown = (value: unknown): AppError => {
  return isAppErrorLike(value)
    ? fromAppErrorLike(value)
    : fromBaseOrUnknown(value);
};

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
      ...(appError.details ? { details: appError.details } : {}),
      ...(appError.name ? { name: appError.name } : {}),
    },
    // Keep the opaque cause reference if present
    appError.cause,
  );

  return be;
}

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

export function toBaseErrorFromUnknown(
  e: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
  context: Readonly<Record<string, unknown>> = {},
): BaseError {
  return normalizeToBaseError(e, fallbackCode, context);
}
