import * as z from "zod";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";

/**
 * Validates invoice form data using Zod schema.
 * Returns parsed data or throws with normalized errors.
 */
export function validateInvoiceFormData(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parsed = CreateInvoiceSchema.safeParse(data);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    const error = new Error(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    (error as any).fieldErrors = fieldErrors;
    throw error;
  }

  return parsed.data;
}
