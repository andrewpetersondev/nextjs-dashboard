import {
  INVOICE_ID_BRAND,
  type InvoiceId,
} from "@/modules/invoices/domain/types/invoice-id.brand";
import { createIdFactory } from "@/shared/utilities/ids/id.factory";

/**
 * Creates a validated and branded InvoiceId from an unknown value.
 *
 * @param value - The value to convert (must be a valid UUID)
 * @returns A Result containing the branded InvoiceId or an AppError
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const createInvoiceId = createIdFactory<
  typeof INVOICE_ID_BRAND,
  InvoiceId
>(INVOICE_ID_BRAND, "InvoiceId");
