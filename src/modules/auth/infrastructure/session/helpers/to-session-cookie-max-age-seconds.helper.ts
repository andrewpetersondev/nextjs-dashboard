import "server-only";
import { millisecondsToSeconds } from "@/shared/time/time.constants";

/**
 * Converts an absolute expiration time in milliseconds to cookie `maxAge` in seconds.
 *
 * @remarks
 * The adapter passes `nowMs` (usually `Date.now()`) explicitly to keep the time dependency visible and testable.
 *
 * @param expiresAtMs - The absolute expiration time in milliseconds.
 * @param nowMs - The current time in milliseconds.
 * @returns The number of seconds until expiration, or 0 if already expired.
 */
export function toSessionCookieMaxAgeSecondsHelper(
  expiresAtMs: number,
  nowMs: number,
): number {
  const secondsUntilExpiry = millisecondsToSeconds(expiresAtMs - nowMs);
  return Math.max(0, secondsUntilExpiry);
}
