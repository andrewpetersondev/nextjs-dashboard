// src/server/auth/application/actions/auth-error-handler.ts
import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import type { FormResult } from "@/shared/forms/types/form-result.types";

export function handleAuthError<F extends string, TPayload = unknown>(
  error: AppError,
  fields: readonly F[],
  raw: Record<string, string>,
  conflictEmailField: F,
): FormResult<F, TPayload> {
  return appErrorToFormResult<F, TPayload>({
    conflictEmailField,
    error,
    fields,
    raw,
  });
}
