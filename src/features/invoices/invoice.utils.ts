import "server-only";

import { getFormField } from "@/lib/utils/utils.server";

/**
 * Helper to extract required invoice fields from FormData.
 * Throws if any field is missing.
 */
export function extractInvoiceFormFields(formData: FormData) {
  const rawAmount = getFormField(formData, "amount");
  const rawCustomerId = getFormField(formData, "customerId");
  const rawStatus = getFormField(formData, "status");
  return { rawAmount, rawCustomerId, rawStatus };
}
