import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";
import type { FormResult } from "@/shared/forms/types/form-result.types";

/**
 * @see appErrorToFormResult
 *
 * @remarks
 * - kept for backwards compatibility
 * - could be a wrapper
 * - deprecate soon because it is basically a duplicate
 */
export function mapAppErrorToFormResult<TField extends string, TData>(p: {
  readonly fields: readonly TField[];
  readonly raw: Readonly<Record<string, unknown>>;
  readonly error: AppError;
  readonly conflictEmailField?: TField;
}): FormResult<TField, TData> {
  return appErrorToFormResult<TField, TData>({
    conflictEmailField: p.conflictEmailField,
    error: p.error,
    fields: p.fields,
    raw: p.raw,
  });
}
