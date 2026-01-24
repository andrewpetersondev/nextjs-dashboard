import "server-only";
import { millisecondsToSeconds } from "@/shared/constants/time.constants";

/**
 * Converts an absolute expiration time in milliseconds to cookie `maxAge` seconds.
 *
 * @remarks
 * The adapter passes `Date.now()` explicitly to keep the time dependency visible and testable.
 */
export function toSessionCookieMaxAgeSecondsHelper(
  expiresAtMs: number,
  nowMs: number,
): number {
  const secondsUntilExpiry = millisecondsToSeconds(expiresAtMs - nowMs);
  return Math.max(0, secondsUntilExpiry);
}
