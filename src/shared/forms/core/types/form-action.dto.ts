import type { FormResult } from "@/shared/forms/core/types/form-result.dto";

/**
 * Standard contract for a Next.js Server Action used with useActionState.
 *
 * @typeParam T - The union of allowed field names for validation errors.
 */
export type FormAction<T extends string> = (
  _prevState: FormResult<T>,
  formData: FormData,
) => Promise<FormResult<T>>;
