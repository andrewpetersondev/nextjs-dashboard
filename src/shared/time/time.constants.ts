/**
 * Milliseconds per second.
 * Used for converting JavaScript's Date.now() (milliseconds) to Unix time (seconds).
 */
export const MILLISECONDS_PER_SECOND = 1000;

/**
 * Returns the current time as a UNIX timestamp in seconds.
 * Useful for session tokens, JWT claims, and temporal validations.
 *
 * @returns Current time in seconds (floored for consistency with JWT standard)
 */
export function nowInSeconds(): number {
  return Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
}

export function secondsToMilliseconds(seconds: number): number {
  return seconds * MILLISECONDS_PER_SECOND;
}

export function millisecondsToSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / MILLISECONDS_PER_SECOND);
}
