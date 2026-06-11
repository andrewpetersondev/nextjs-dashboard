import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import type { FormValidationMetadata } from "@/shared/forms/core/types/validation.types";

/**
 * Type guard: checks if an AppError (entity or serialized DTO) contains form
 * validation details.
 */
export function isFormValidationError<TFields extends string>(
	error: AppErrorLike,
): error is AppErrorLike & {
	readonly metadata: FormValidationMetadata<TFields>;
} {
	return (
		error.key === APP_ERROR_KEYS.validation &&
		error.metadata !== undefined &&
		error.metadata !== null &&
		typeof error.metadata === "object" &&
		"fieldErrors" in error.metadata
	);
}
