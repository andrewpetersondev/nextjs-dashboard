/**
 * @file EventBus implementation for domain events.
 * @description In-memory event bus for decoupling event publishers and subscribers.
 * @see src/features/revenues/event-driven-revenue-strategy.md
 */
import "server-only";
import { logger } from "@/lib/logging/logger";

/**
 * Type for event handler functions.
 */
export type EventHandler<T> = (event: T) => void | Promise<void>;

/**
 * Domain events mapping: event name -> payload type.
 *
 * Projects can augment this interface via declaration merging to add their own
 * event names and payloads:
 *
 * declare module "@/lib/events/eventBus" {
 *   interface DomainEvents {
 *     InvoicePaidEvent: { invoiceId: string; amount: number };
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DomainEvents {
  // By default allow any string event name with unknown payload.
  // Projects should augment this interface with specific events.
  [event: string]: unknown;
}

type EventName = Extract<keyof DomainEvents, string>;

type EventPayload<K extends EventName> = DomainEvents[K];

/**
 * EventBus for domain events. Supports subscribing and publishing events by event name.
 */
export class EventBus {
  // Static-only utility: prevent instantiation and subclassing
  private constructor() {
    // This class is not meant to be instantiated.
  }

  // Use unknown internally to avoid unsafe "any" while keeping runtime flexible.
  private static handlers: Partial<Record<EventName, EventHandler<unknown>[]>> =
    {};

  /**
   * Subscribe to an event by name.
   * @param eventName - The name of the event (e.g., 'InvoicePaidEvent')
   * @param handler - The handler function to invoke when the event is published
   */
  static subscribe<K extends EventName>(
    eventName: K,
    handler: EventHandler<EventPayload<K>>,
  ): void;
  static subscribe<T>(eventName: string, handler: EventHandler<T>): void;
  static subscribe(eventName: string, handler: EventHandler<unknown>): void {
    if (!EventBus.handlers[eventName as EventName]) {
      EventBus.handlers[eventName as EventName] = [];
    }
    // Store as unknown internally to keep the internal registry type-agnostic
    (EventBus.handlers[eventName as EventName] as EventHandler<unknown>[]).push(
      handler as EventHandler<unknown>,
    );
  }

  /**
   * Publish an event by name.
   * @param eventName - The name of the event
   * @param event - The event payload
   */
  static async publish<K extends EventName>(
    eventName: K,
    event: EventPayload<K>,
  ): Promise<void>;
  static async publish<T>(eventName: string, event: T): Promise<void>;
  static async publish(eventName: string, event: unknown): Promise<void> {
    const handlers = (EventBus.handlers[eventName as EventName] ||
      []) as EventHandler<unknown>[];
    for (const handler of handlers) {
      try {
        // We trust the caller provided the correct payload type for this event name
        await (handler as EventHandler<unknown>)(event);
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
