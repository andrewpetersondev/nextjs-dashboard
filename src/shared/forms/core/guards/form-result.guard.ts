import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import type { FormValidationMetadata } from "@/shared/forms/core/types/validation.types";

/**
 * Type guard: checks if an AppError (entity or serialized DTO) structurally
 * carries form validation metadata.
 *
 * Key-agnostic by design. The shared writer (`makeFormError`) stamps
 * {@link FormValidationMetadata} (`fieldErrors` / `formData` / `formErrors`)
 * onto whatever key the action chose — `validation` on the happy path,
 * `conflict` for a duplicate-email/username signup, etc. — so the read side
 * must recognize form metadata by SHAPE, not by `error.key`. Gating on the key
 * caused the writer/reader divergence where a `conflict` error returned field
 * errors but dropped the echoed `formData`/`formErrors`.
 *
 * The structural `fieldErrors`-presence check is retained, so a `validation`-
 * or `conflict`-keyed error WITHOUT form metadata (e.g. a bare-pgCode conflict)
 * still fails the guard and the extractors still return undefined / frozen [].
 */
export function isFormValidationError<TFields extends string>(
	error: AppErrorLike,
): error is AppErrorLike & {
	readonly metadata: FormValidationMetadata<TFields>;
} {
	return (
		error.metadata !== undefined &&
		error.metadata !== null &&
		typeof error.metadata === "object" &&
		"fieldErrors" in error.metadata
	);
}
