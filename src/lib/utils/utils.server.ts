/**
 *@file utils.server.ts
 * @description
 * - Utility functions in this file are server-only.
 * - Utility functions should use const (arrow functions) for better performance and readability.
 *
 */

import "server-only";

import type { ActionResult } from "@/features/users/user.types";

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

/**
 * Returns a standardized action result object for server actions.
 *
 * @template T - The type of the `data` property, if present.
 * @param params - The parameters for the action result.
 * @returns An `ActionResult` object.
 */
export function actionResult<T = undefined>(params: {
  data?: T;
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}): ActionResult<T> {
  return {
    errors: params.errors ?? {},
    message: params.message ?? "",
    success: params.success ?? true,
    ...(params.data !== undefined ? { data: params.data } : {}),
  };
}

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
export const getFormField = <T extends string>(
  formData: FormData,
  key: string,
): T => {
  const value = formData.get(key);
  if (typeof value !== "string") {
    throw new Error(`Form field "${key}" is missing or not a string.`);
  }
  return value as T;
};
