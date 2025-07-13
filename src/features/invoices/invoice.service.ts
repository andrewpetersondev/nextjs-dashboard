import type { InvoiceCreateInput } from "@/features/invoices/invoice.types";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.types";
import { extractInvoiceFormFields } from "@/features/invoices/invoice.utils";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toCustomerId, toInvoiceStatusBrand } from "@/lib/definitions/brands";

/**
 * Validates and transforms form data for invoice creation.
 * @param formData - The FormData object from the request.
 * @returns InvoiceCreateInput if valid, or throws with validation errors.
 */
export function validateAndTransformInvoiceForm(
  formData: FormData,
): InvoiceCreateInput {
  const { rawAmount, rawCustomerId, rawStatus } =
    extractInvoiceFormFields(formData);

  const validated = CreateInvoiceSchema.safeParse({
    amount: rawAmount,
    customerId: rawCustomerId,
    status: rawStatus,
  });

  if (!validated.success) {
    // Throw with validation errors for the action to catch and handle
    const error = new Error(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    (error as any).fieldErrors = validated.error.flatten().fieldErrors;
    throw error;
  }

  const { amount, customerId, status } = validated.data;
  return {
    amount: Math.round(amount * 100),
    customerId: toCustomerId(customerId),
    date: new Date().toISOString().split("T")[0],
    status: toInvoiceStatusBrand(status),
  };
}
