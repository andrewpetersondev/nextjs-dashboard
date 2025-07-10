import "server-only";

import type {
  CreateInvoiceResult,
  InvoiceErrorMap,
} from "@/lib/definitions/invoices.types";
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

// --- Helper: Standardized Action Result ---
export const actionResult = <T = undefined>({
  data = undefined,
  errors = undefined,
  message,
  success = true,
}: {
  data?: T;
  errors?: Record<string, string[]>;
  message: string;
  success?: boolean;
}): ActionResult & { data?: T } => ({
  data,
  errors,
  message,
  success,
});

/**
 * Strongly typed action result for invoice actions.
 */
export const invoiceActionResult = ({
  errors,
  message,
  success = true,
}: {
  errors?: InvoiceErrorMap;
  message: string;
  success?: boolean;
}): CreateInvoiceResult => ({
  errors,
  message,
  success,
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
