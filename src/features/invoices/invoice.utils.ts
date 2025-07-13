import "server-only";

import { getFormField } from "@/lib/utils/utils.server";

/**
 * Extracts and returns required invoice fields from a FormData object.
 *
 * - Throws if any required field is missing or not a string.
 * - Use this utility to safely parse form submissions for invoice creation or update.
 *
 * @param formData - The FormData object from a request.
 * @returns {Object} - Object containing rawAmount, rawCustomerId, and rawStatus as strings.
 * @throws {Error} - If any field is missing or invalid.
 *
 * @example
 * const { rawAmount, rawCustomerId, rawStatus } = extractInvoiceFormFields(formData);
 */
export function extractInvoiceFormFields(formData: FormData): {
  rawAmount: string;
  rawCustomerId: string;
  rawStatus: string;
} {
  const rawAmount = getFormField(formData, "amount");
  const rawCustomerId = getFormField(formData, "customerId");
  const rawStatus = getFormField(formData, "status");
  return { rawAmount, rawCustomerId, rawStatus };
}
