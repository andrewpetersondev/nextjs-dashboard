import "server-only";

import type { BaseInvoiceEvent } from "@/server/events/invoice/invoice-event.types";
import { serverLogger } from "@/server/logging/serverLogger";

/**
 * Creates a standardized log entry
 */
type JsonPrimitive = string | number | boolean | null;

/**
 * JSON-serializable value used for structured logs.
 */
export type LogValue =
  | JsonPrimitive
  | readonly LogValue[]
  | { readonly [key: string]: LogValue };

/**
 * Bag of JSON-serializable metadata for logs.
 */
export type LogMetadata = { readonly [key: string]: LogValue };

/**
 * Creates a standardized log entry
 */
export function logInfo(
  context: string,
  message: string,
  metadata?: LogMetadata,
): void {
  serverLogger.info({
    context,
    message,
    ...(metadata ?? {}),
  });
}

/**
 * Creates a standardized error log entry
 */
export function logError(
  context: string,
  message: string,
  error?: unknown,
  metadata?: LogMetadata,
): void {
  serverLogger.error({
    context,
    error,
    message,
    ...(metadata ?? {}),
  });
}

/**
 * Logs an error when an update event lacks the previous invoice state.
 */
export function logMissingPrevious(
  context: string,
  eventId: string,
  invoiceId: string,
): void {
  logError(
    context,
    "Missing previous invoice state",
    new Error("Invalid invoice update event"),
    { eventId, invoiceId },
  );
}

/**
 * Logs when an update event doesn't impact revenue calculations.
 */
export function logNoRelevantChange(
  context: string,
  eventId: string,
  invoiceId: string,
): void {
  logInfo(context, "No relevant changes for revenue calculation", {
    eventId,
    invoiceId,
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
