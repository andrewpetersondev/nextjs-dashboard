/**
 * Client-safe logger facade.
 * - In the browser, delegates to console.*
 * - On the server, also delegates to console.* by default (can be wired to a server logger later).
 * Import this module from features/shared code instead of server-only loggers.
 */
// biome-ignore lint/suspicious/noExplicitAny: <fix later>
function safeInvoke(fn: (...a: any[]) => void, ...args: any[]): void {
  try {
    fn(...args);
  } catch {
    // no-op
  }
}

export type LogPayload = unknown;

export const logger = {
  debug(payload: LogPayload): void {
    safeInvoke(console.debug, payload);
  },
  error(payload: LogPayload): void {
    safeInvoke(console.error, payload);
  },
  info(payload: LogPayload): void {
    safeInvoke(console.info, payload);
  },
  warn(payload: LogPayload): void {
    safeInvoke(console.warn, payload);
  },
} as const;
