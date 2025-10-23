// src/server/auth/application/actions/auth-error-handler.ts
import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { FormResult } from "@/shared/forms/core/types";
import { appErrorToFormResult } from "@/shared/forms/errors/app-error.adapter";

/**
 * @deprecated Use `appErrorToFormResult` from `@/shared/forms/errors/app-error.adapter` directly.
 * This wrapper will be removed in a future release.
 */
export function handleAuthError<F extends string>(
  error: AppError,
  fields: readonly F[],
  raw: Record<string, string>,
  conflictEmailField: F,
): FormResult<F, never> {
  return appErrorToFormResult<F>({
    conflictEmailField,
    error,
    fields,
    raw,
  });
}
