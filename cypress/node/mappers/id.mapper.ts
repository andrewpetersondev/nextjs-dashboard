import type { CustomerId, UserId } from "@database/schema/schema.types";

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate that a value is a UUID string and return its trimmed form.
 */
function validateUuid(value: unknown, label: string): string {
	if (typeof value !== "string") {
		throw new Error(`Invalid ${label}: expected string, got ${typeof value}`);
	}

	const normalizedValue = value.trim();

	if (normalizedValue.length === 0) {
		throw new Error(`${label} cannot be empty`);
	}

	if (!UUID_REGEX.test(normalizedValue)) {
		throw new Error(
			`Invalid ${label}: "${String(value)}". Must be a valid UUID.`,
		);
	}

	return normalizedValue;
}

/**
 * Convert an arbitrary value to a validated customer id.
 */
export function toCustomerId(value: unknown): CustomerId {
	return validateUuid(value, "customer id") as CustomerId;
}

/**
 * Convert an arbitrary value to a validated user id.
 */
export function toUserId(value: unknown): UserId {
	return validateUuid(value, "user id") as UserId;
}
