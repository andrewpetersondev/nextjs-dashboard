// File: 'src/shared/core/errors/app-error/app-error-builders.ts'
// Builders, augmentation, lifting, and BaseError <-> AppError conversions

import { IS_PROD } from "@/shared/config/env-shared";
import type { BaseError } from "@/shared/core/errors/base/base-error";
import { tryGetErrorCodeMeta } from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { DEFAULT_UNKNOWN_MESSAGE } from "@/shared/core/result/app-error/app-error.constants";

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
