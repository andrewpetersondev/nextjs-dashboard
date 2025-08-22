import "server-only";

import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { logger } from "@/server/logging/logger";

/**
 * Creates a standardized log entry
 */
export function logInfo(
  context: string,
  message: string,
  metadata?: Record<string, unknown>,
): void {
  logger.info({
    context,
    message,
    ...metadata,
  });
}

/**
 * Creates a standardized error log entry
 */
export function logError(
  context: string,
  message: string,
  error?: unknown,
  metadata?: Record<string, unknown>,
): void {
  logger.error({
    context,
    error,
    message,
    ...metadata,
  });
}

/**
 * Safely handles errors in event handlers without throwing exceptions
 * that would disrupt the event bus.
 */
export function handleEventError(
  context: string,
  event: BaseInvoiceEvent,
  error: unknown,
): void {
  // Don't throw - avoid blocking the event bus
  logError(context, "Error handling invoice event", error, {
    eventId: event.eventId,
    invoiceId: event.invoice.id,
  });
}
