import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/types/form-result.dto";

/**
 * Standard contract for a Next.js Server Action used with useActionState.
 *
 * `prevState` is a {@link FormState} (`null` on the first submission after an
 * idle render) but the action always returns a {@link FormResult} — actions
 * cannot produce idle (ADR 001).
 *
 * @typeParam Tfieldnames - The union of allowed field names for validation errors.
 * @typeParam Tresult - The type of data returned on success.
 */
export type FormAction<_Tfieldnames extends string, Tresult = unknown> = (
	_prevState: FormState<Tresult>,
	formData: FormData,
) => Promise<FormResult<Tresult>>;
