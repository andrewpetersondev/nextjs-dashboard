// src/server/auth/application/actions/auth-error-handler.ts
import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { FormResult } from "@/shared/forms/core/types";
import { appErrorToFormResult } from "@/shared/forms/errors/app-error.adapter";

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
