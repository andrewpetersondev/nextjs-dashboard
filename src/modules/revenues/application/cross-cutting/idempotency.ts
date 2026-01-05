import "server-only";

/**
 * Process-local idempotency registry for event handling.
 *
 * IMPORTANT: This only deduplicates within a single Node.js process. In multi-instance
 * deployments or after restarts, duplicates can still occur. For robust exactly-once
 * semantics, persist processed event IDs in a durable store with unique constraints.
 */
const processedEventIds: Set<string> = new Set();

/**
 * Checks whether the given eventId has already been processed in this process.
 */
function hasProcessedEvent(eventId: string | undefined | null): boolean {
  if (!eventId) {
    return false;
  }
  return processedEventIds.has(eventId);
}

/**
 * Marks the given eventId as processed in this process.
 */
function markEventProcessed(eventId: string | undefined | null): void {
  if (!eventId) {
    return;
  }
  processedEventIds.add(eventId);
}

/**
 * Runs a function once per eventId within this process. If the event has already been
 * processed, the function is skipped. On success, the eventId is recorded as processed.
 */
export async function withIdempotency<T>(
  eventId: string | undefined | null,
  fn: () => Promise<T>,
): Promise<{ executed: boolean; result?: T }> {
  if (hasProcessedEvent(eventId)) {
    return { executed: false };
  }

  const result = await fn();
  markEventProcessed(eventId);
  return { executed: true, result };
}
