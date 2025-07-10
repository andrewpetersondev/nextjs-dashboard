import "server-only";

import {
  type ActionResult,
  USER_ROLES,
  type UserRole,
} from "@/lib/definitions/users.types";

// Note: Utility functions in this file are server-only.
// Note: Utility functions should use const (arrow functions) for better performance and readability.

// --- Helper: Normalize Zod fieldErrors to Record<string, string[]> ---
export const normalizeFieldErrors = (
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const key in fieldErrors) {
    if (Object.hasOwn(fieldErrors, key)) {
      result[key] = fieldErrors[key] ?? [];
    }
  }
  return result;
};

/**
 * Returns a standardized action result object for server actions.
 *
 * - Always includes the required `success` property (defaults to `true` if omitted).
 * - Omits optional properties (`errors`, `data`) if they are `undefined`, ensuring compatibility with `exactOptionalPropertyTypes`.
 * - Uses function overloads for precise typing: if `data` is provided, it is included in the result type.
 *
 * @template T - The type of the `data` property, if present.
 * @param params - The parameters for the action result.
 * @param params.message - A human-readable message describing the result.
 * @param params.success - Whether the action succeeded (defaults to `true`).
 * @param params.errors - Optional error map for field-level errors.
 * @param params.data - Optional data payload to include in the result.
 * @returns An `ActionResult` object, optionally including `data` if provided.
 *
 * @example
 * // Success without data
 * actionResult({ message: "User created." });
 *
 * // Failure with errors
 * actionResult({ message: "Validation failed.", errors: { email: ["Invalid"] }, success: false });
 *
 * // Success with data
 * actionResult({ message: "Fetched user.", data: user });
 */
export function actionResult(params: {
  message: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}): ActionResult;
export function actionResult<T>(params: {
  data: T;
  message: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}): ActionResult & { data: T };
export function actionResult<T = undefined>(params: {
  data?: T;
  message: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}): ActionResult | (ActionResult & { data: T }) {
  const { data, errors, message, success = true } = params;
  // Only include optional properties if they are defined
  const result: ActionResult & Partial<{ data: T }> = {
    message,
    success,
    ...(errors !== undefined ? { errors } : {}),
    ...(data !== undefined ? { data } : {}),
  };
  return result;
}

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

/**
 * Utility to create random strings for demo user passwords or other purposes.
 * Needs to generate at least one capital letter, one number, and one special character.
 * @param length - The desired length of the random string.
 * @returns A random string of the specified length.
 */
export const createRandomPassword = (length = 10): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
