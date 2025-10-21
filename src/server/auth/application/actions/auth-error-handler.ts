// src/server/auth/application/actions/auth-error-handler.ts
import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import type { FormResult } from "@/shared/forms/types/form-result.types";

export function handleAuthError<F extends string>(
  error: AppError,
  fields: readonly F[],
  raw: Record<string, string>,
  conflictEmailField: F,
): FormResult<F, unknown> {
  return appErrorToFormResult<F, unknown>({
    conflictEmailField,
    error,
    fields,
    raw,
  });
}
