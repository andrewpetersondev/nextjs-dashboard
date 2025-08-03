/**
 * @file EventBus implementation for domain events.
 * @description In-memory event bus for decoupling event publishers and subscribers.
 * @see src/features/revenues/event-driven-revenue-strategy.md
 */

import { logger } from "@/lib/utils/logger";

/**
 * Type for event handler functions.
 */
export type EventHandler<T> = (event: T) => void | Promise<void>;

/**
 * EventBus for domain events. Supports subscribing and publishing events by event name.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EventBus {
  private static handlers: Record<string, EventHandler<any>[]> = {};

  /**
   * Subscribe to an event by name.
   * @param eventName - The name of the event (e.g., 'InvoicePaidEvent')
   * @param handler - The handler function to invoke when the event is published
   */
  static subscribe<T>(eventName: string, handler: EventHandler<T>): void {
    if (!EventBus.handlers[eventName]) {
      EventBus.handlers[eventName] = [];
    }
    EventBus.handlers[eventName].push(handler);
  }

  /**
   * Publish an event by name.
   * @param eventName - The name of the event
   * @param event - The event payload
   */
  static async publish<T>(eventName: string, event: T): Promise<void> {
    const handlers = EventBus.handlers[eventName] || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        // Structured logging for event errors
        logger.error({
          context: "EventBus.publish",
          error: error instanceof Error ? error.message : String(error),
          eventName,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
  }
}
