/**
 *@file utils.server.ts
 * @description
 * - Utility functions in this file are server-only.
 * - Utility functions should use const (arrow functions) for better performance and readability.
 *
 */

import "server-only";
import pino from "pino";
import {
  type ActionResult,
  USER_ROLES,
  type UserRole,
} from "@/features/users/user.types";

/**
 * Builds a typed error map for form fields, including only fields with actual errors.
 *
 * @template T - Field name type.
 * @param errors - Partial error map with possible undefined values.
 * @returns Partial error map with only fields that have errors.
 */
export const buildErrorMap = <T extends string>(
  errors: Partial<Record<T, string[] | undefined>>,
): Partial<Record<T, string[]>> => {
  const result: Partial<Record<T, string[]>> = {};
  for (const [key, value] of Object.entries(errors) as [
    T,
    string[] | undefined,
  ][]) {
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Normalizes Zod fieldErrors to a consistent Record<string, string[]> shape.
 *
 * @param fieldErrors - Zod fieldErrors object.
 * @returns Normalized error map.
 */
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
 * - Omits optional properties (`errors`, `data`) if they are `undefined`.
 * - Uses function overloads for precise typing.
 *
 * @template T - The type of the `data` property, if present.
 * @param params - The parameters for the action result.
 * @returns An `ActionResult` object, optionally including `data` if provided.
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
 *
 * - Logs errors with context and optional metadata.
 * - Extend to integrate with external logging services.
 *
 * @param context - Context string for the error (e.g., function name).
 * @param error - The error object or message.
 * @param meta - Optional metadata for structured logging.
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
 *
 * - Throws if the field is missing or not a string.
 * - Use for robust form parsing.
 *
 * @template T - Expected return type (defaults to string).
 * @param formData - The FormData object.
 * @param key - The field key to extract.
 * @returns The field value as type T.
 * @throws {Error} - If the field is missing or not a string.
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

/**
 * Validates and returns a user role, defaulting to "guest" if invalid.
 *
 * @param role - The role to validate.
 * @returns {UserRole} - A valid user role.
 */
export const getValidUserRole = (role: unknown): UserRole =>
  USER_ROLES.includes(role as UserRole) ? (role as UserRole) : "guest";

/**
 * Generates a random password string with at least one capital letter, one number, and one special character.
 *
 * @param length - Desired length of the password (default: 10).
 * @returns {string} - The generated password.
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

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  name: "auth",
});

/**
 * Validates that an object has all required fields with expected types.
 * Throws an error if any field is missing or of the wrong type.
 *
 * @param obj - The object to validate.
 * @param schema - An object mapping field names to expected types (e.g., "string", "number").
 * @param context - Optional context for error messages.
 * @throws {Error} If a required field is missing or has the wrong type.
 */
export function validateRequiredFields<T extends object>(
  obj: unknown,
  schema: Record<
    keyof T,
    "string" | "number" | "boolean" | "object" | "undefined" | "function"
  >,
  context = "object",
): asserts obj is T {
  if (typeof obj !== "object" || obj === null) {
    throw new Error(`Invalid ${context}: not an object`);
  }
  for (const [key, type] of Object.entries(schema)) {
    // @ts-expect-error: dynamic property access
    if (typeof obj[key] !== type) {
      throw new Error(
        `Invalid ${context}: missing or invalid field "${key}" (expected ${type})`,
      );
    }
  }
}
