import "server-only";

import type { ActionResult } from "@/lib/types/action-result";

/**
 * Constructs and returns an ActionResult object based on the provided parameters.
 *
 * @param params The parameters to define the action result.
 * @param params.message A description or message representing the result of the action.
 * @param params.success An optional boolean indicating if the action was successful. Defaults to undefined.
 * @param params.errors An optional object containing error messages indexed by field names, where each field name maps to an array of error strings.
 * @return Returns an ActionResult object containing the details of the action result.
 */
export function actionResult(params: {
  message: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}): ActionResult;
/**
 * Creates an action result object with the specified data, message, success status, and errors.
 *
 * @param params An object containing the following properties:
 * - `data`: The payload of the result.
 * - `message`: A message describing the result.
 * - `success`: An optional flag indicating the success status of the action. Defaults to `false` if not provided.
 * - `errors`: An optional record of errors where keys are field names and values are arrays of error messages.
 *
 * @return Returns an object that combines the `ActionResult` interface and includes the provided data.
 */
export function actionResult<T>(params: {
  data: T;
  message: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}): ActionResult & { data: T };
/**
 * Constructs an ActionResult object with provided parameters.
 *
 * @param params - The input parameters to create the ActionResult.
 * @param params.data - Optional data of generic type T to be included in the result.
 * @param params.message - An optional message associated with the result.
 * @param params.success - A boolean indicating whether the operation was successful. Defaults to true.
 * @param params.errors - An optional object containing error details in the form of key-value pairs,
 * where the key is a string and the value is an array of strings.
 * @returns An ActionResult object containing the combined parameters.
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
