import type { FormResult } from "@/shared/forms/core/types/form-result.dto";

/**
 * Standard contract for a Next.js Server Action used with useActionState.
 *
 * @typeParam Tfieldnames - The union of allowed field names for validation errors.
 * @typeParam Tresult - The type of data returned on success.
 */
export type FormAction<_Tfieldnames extends string, Tresult = unknown> = (
  _prevState: FormResult<Tresult>,
  formData: FormData,
) => Promise<FormResult<Tresult>>;
