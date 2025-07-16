import "server-only";

import type { InvoiceEntity } from "@/db/models/invoice.entity";
import { brandInvoiceFields } from "@/features/invoices/invoice.branding";
import { transformUiInvoiceFields } from "@/features/invoices/invoice.mapper";
import {
  CreateInvoiceSchema,
  INVOICE_FIELD_NAMES,
  type InvoiceFieldName,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import type { CustomerId } from "@/lib/definitions/brands";
import type { FormErrors } from "@/lib/forms/form.types";
import { validateFormData } from "@/lib/forms/form-validation";

/**
 * Validates and transforms form data for invoice creation.
 * Returns branded DAL input or error state.
 */
export function processInvoiceFormData(formData: FormData): {
  dalInput?: Omit<Readonly<InvoiceEntity>, "id" | "sensitiveData">;
  errors?: FormErrors<InvoiceFieldName>; // target type
  message?: string;
} {
  const validation = validateFormData(
    formData,
    CreateInvoiceSchema,
    INVOICE_FIELD_NAMES,
  );

  if (!validation.success || !validation.data) {
    return {
      errors: validation.errors, // source type
      message: "Invalid invoice input.",
    };
  }

  try {
    const transformed = transformUiInvoiceFields(validation.data);
    const branded = brandInvoiceFields(transformed);

    return {
      dalInput: {
        amount: branded.amount as number,
        customerId: branded.customerId as CustomerId,
        date: branded.date as string,
        status: branded.status as InvoiceStatus,
      },
    };
  } catch (error) {
    return {
      errors: {},
      message:
        error instanceof Error ? error.message : "Transformation failed.",
    };
  }
}
