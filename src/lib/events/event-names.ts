export const INVOICE_EVENTS = {
  CREATED: "InvoiceCreatedEvent",
  DELETED: "InvoiceDeletedEvent",
  UPDATED: "InvoiceUpdatedEvent",
} as const;

export type InvoiceEventName =
  (typeof INVOICE_EVENTS)[keyof typeof INVOICE_EVENTS];
