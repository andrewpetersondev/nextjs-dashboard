import "server-only";

import type { InvoiceDto } from "@/shared/invoices/dto";

/**
 * @description This list defines the operations that can be performed on invoices.
 */
const InvoiceOperations = [
  "invoice_created",
  "invoice_updated",
  "invoice_deleted",
] as const;

export const INVOICE_EVENTS = {
  CREATED: "InvoiceCreatedEvent",
  DELETED: "InvoiceDeletedEvent",
  UPDATED: "InvoiceUpdatedEvent",
} as const;

/**
 * @description Base interface for invoice events.
 * Contains common properties shared by all invoice-related events.
 */
export interface BaseInvoiceEvent {
  /** Unique identifier for the event (uuid) */
  eventId: string;
  /** ISO timestamp when the event occurred */
  eventTimestamp: string;
  /** Invoice data at the time of the event */
  invoice: InvoiceDto;
  /** Operation type that triggered the event */
  operation: (typeof InvoiceOperations)[number];
  /** Previous invoice state (for updates) */
  previousInvoice?: InvoiceDto;
}
