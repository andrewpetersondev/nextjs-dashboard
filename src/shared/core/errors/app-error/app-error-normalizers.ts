// File: 'src/shared/core/errors/app-error/app-error-normalizers.ts'
// Normalizers and app-error between unknown/BaseError/AppError

import {
  freezeDev,
  isAppErrorLike,
  pickOptionalFromLike,
  toSeverity,
} from "@/shared/core/errors/app-error/app-error-internal";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { normalizeToBaseError } from "@/shared/core/errors/base/base-error-adapters";
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
