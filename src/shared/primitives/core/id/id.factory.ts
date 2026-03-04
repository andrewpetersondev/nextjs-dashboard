import { createBrand } from "@/shared/core/branding/brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a value is a non-empty string matching the UUID v4 format.
 *
 * @param value - The value to validate
 * @param label - A human-readable label for error messages
 * @returns A Result containing the trimmed UUID string or an AppError
 */
const validateUuid = (
	value: unknown,
	label: string,
): Result<string, AppError> => {
	if (typeof value !== "string") {
		return Err(
			makeAppError(APP_ERROR_KEYS.validation, {
				cause: "",
				message: `Invalid ${label}: expected string, got ${typeof value}`,
				metadata: {},
			}),
		);
	}
	const v = value.trim();
	if (v.length === 0) {
		return Err(
			makeAppError("validation", {
				cause: "",
				message: `${label} cannot be empty`,
				metadata: {},
			}),
		);
	}
	if (!UUID_REGEX.test(v)) {
		return Err(
			makeAppError("validation", {
				cause: "",
				message: `Invalid ${label}: "${value}". Must be a valid UUID.`,
				metadata: {},
			}),
		);
	}
	return Ok(v);
};

/**
 * Creates a factory function that validates and brands UUID strings.
 *
 * @param brand - The brand symbol to apply
 * @param label - A human-readable label for error messages
 * @typeParam S - The brand symbol type
 * @typeParam B - The branded ID type
 * @returns A factory function that creates branded IDs from unknown values
 */
export const createIdFactory = <S extends symbol, B>(
	brand: S,
	label: string,
) => {
	return (value: unknown): Result<B, AppError> => {
		const result = validateUuid(value, label);
		if (!result.ok) {
			return result;
		}
		return Ok(createBrand<string, S>(brand)(result.value) as B);
	};
};
