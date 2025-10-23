// src/server/auth/application/actions/auth-error-handler.ts
import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { FormResult } from "@/shared/forms/core/types";
import { appErrorToFormResult } from "@/shared/forms/errors/app-error.adapter";

/**
 * @deprecated Use `appErrorToFormResult` from `@/shared/forms/errors/app-error.adapter` directly.
 * This wrapper will be removed in a future release.
 */
export function handleAuthError<TField extends string>(
  error: AppError,
  fields: readonly TField[],
  raw: Record<string, string>,
  conflictEmailField: TField,
): FormResult<TField, never> {
  return appErrorToFormResult<TField>({
    conflictEmailField,
    error,
    fields,
    raw,
  });
}
