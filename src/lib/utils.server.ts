import "server-only";

import { USER_ROLES, type UserRole } from "@/src/lib/definitions/roles";
import type { ActionResult } from "@/src/lib/definitions/users";

// Note: Utility functions in this file are server-only.
// Note: Utility functions should use const (arrow functions) for better performance and readability.

// --- Helper: Normalize Zod fieldErrors to Record<string, string[]> ---
export const normalizeFieldErrors = (
	fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> => {
	const result: Record<string, string[]> = {};
	for (const key in fieldErrors) {
		if (Object.prototype.hasOwnProperty.call(fieldErrors, key)) {
			result[key] = fieldErrors[key] ?? [];
		}
	}
	return result;
};

// --- Helper: Standardized Action Result ---
export const actionResult = ({
	message,
	success = true,
	errors = undefined,
}: {
	message: string;
	success?: boolean;
	errors?: Record<string, string[]>;
}): ActionResult => ({
	message,
	success,
	errors,
});

export type LogMeta = {
	userId?: string;
	email?: string;
	action?: string;
	[key: string]: unknown;
};

/**
 * Centralized error logger for server actions.
 * Extend this to integrate with external logging services.
 */
export const logError = (
	context: string,
	error: unknown,
	meta?: LogMeta,
): void => {
	console.error(`[${context}]`, { error, ...meta });
};

/**
 * Safely extracts and strongly types a field from FormData.
 * Throws if the field is missing or not a string.
 */
export const getFormField = <T extends string = string>(
	formData: FormData,
	key: string,
): T => {
	const value = formData.get(key);
	if (typeof value !== "string") {
		throw new Error(`Form field "${key}" is missing or not a string.`);
	}
	return value as T;
};

// Utility to validate role
export const getValidUserRole = (role: unknown): UserRole =>
	USER_ROLES.includes(role as UserRole) ? (role as UserRole) : "guest";
