import "server-only";

import type { InvoiceEntity } from "@/db/models/invoice.entity";
import { brandInvoiceFields } from "@/features/invoices/invoice.branding";
import { uiToInvoiceDto } from "@/features/invoices/invoice.mapper";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.schemas";
import {
  INVOICE_FIELD_NAMES,
  type InvoiceFieldName,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import type { CustomerId } from "@/lib/definitions/brands";
import type { FormErrors } from "@/lib/forms/form.types";
import { validateFormData } from "@/lib/forms/form-validation";

/**
 * Validates and transforms invoice form data for creation.
 *
 * - Uses Zod schema for validation.
 * - Transforms and brands input for DAL/database safety.
 * - Returns branded DAL input or error state for UI feedback.
 *
 * @param formData - FormData from the client invoice form.
 * @returns Object containing:
 *   - `dalInput`: Branded invoice entity for DAL (if valid).
 *   - `errors`: Field-level error map (if validation fails).
 *   - `message`: General error or status message.
 *
 * @example
 * const { dalInput, errors, message } = processInvoiceFormData(formData);
 * if (!dalInput) {
 *   // Display errors and message in the UI
 * }
 */
export function processInvoiceFormData(formData: FormData): {
  dalInput?: Omit<Readonly<InvoiceEntity>, "id">;
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
    const transformed = uiToInvoiceDto(validation.data);
    const branded = brandInvoiceFields(transformed);

    return {
      dalInput: {
        amount: branded.amount as number,
        customerId: branded.customerId as CustomerId,
        date: branded.date as string,
        sensitiveData: branded.sensitiveData as string,
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
