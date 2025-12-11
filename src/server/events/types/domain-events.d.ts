import "server-only";

import type {
  BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";

/**
 * Module augmentation for the EventBus DomainEvents map.
 * Centralizes known event names and payload types for strong typing.
 */
declare module "@/server/events/event-bus" {
  type InvoiceEventNames = (typeof INVOICE_EVENTS)[keyof typeof INVOICE_EVENTS];

  type InvoiceEventsMap = {
    readonly [K in InvoiceEventNames]: BaseInvoiceEvent;
  };

  // Merge into DomainEvents to provide strong typing for invoice-related events.
  interface DomainEvents extends InvoiceEventsMap {}
}
