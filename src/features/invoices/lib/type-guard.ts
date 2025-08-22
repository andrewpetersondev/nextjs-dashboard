import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/types";

/**
 * Type guard to check if a value is a valid InvoiceStatus
 * @param value - The value to check
 * @returns True if the value is a valid InvoiceStatus
 */
export function isInvoiceStatus(value: unknown): value is InvoiceStatus {
  return (
    typeof value === "string" &&
    INVOICE_STATUSES.includes(value as InvoiceStatus)
  );
}
