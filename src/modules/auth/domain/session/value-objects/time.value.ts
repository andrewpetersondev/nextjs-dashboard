import {
  createDurationSeconds,
  createTimeDeltaSeconds,
  createUnixSeconds,
  type DurationSeconds,
  type TimeDeltaSeconds,
  type UnixSeconds,
} from "@/modules/auth/domain/session/value-objects/auth-brands.value";

/**
 * Converts a number to {@link UnixSeconds} with strict validation.
 *
 * @throws Error
 * Thrown when the input is not a safe integer or is negative.
 */
export function toUnixSeconds(value: number): UnixSeconds {
  if (!Number.isSafeInteger(value)) {
    throw new Error("UnixSeconds must be a safe integer.");
  }
  if (value < 0) {
    throw new Error("UnixSeconds must be >= 0.");
  }
  return createUnixSeconds(value);
}

/**
 * Converts a number to {@link DurationSeconds} with strict validation.
 *
 * @remarks
 * DurationSeconds is non-negative by design (use {@link TimeDeltaSeconds} for signed deltas).
 *
 * @throws Error
 * Thrown when the input is not a safe integer or is negative.
 */
export function toDurationSeconds(value: number): DurationSeconds {
  if (!Number.isSafeInteger(value)) {
    throw new Error("DurationSeconds must be a safe integer.");
  }
  if (value < 0) {
    throw new Error("DurationSeconds must be >= 0.");
  }
  return createDurationSeconds(value);
}

/**
 * Converts a number to {@link TimeDeltaSeconds} with strict validation.
 *
 * @remarks
 * Signed delta seconds: can be negative (e.g., "expired by 10 seconds").
 *
 * @throws Error
 * Thrown when the input is not a safe integer.
 */
export function toTimeDeltaSeconds(value: number): TimeDeltaSeconds {
  if (!Number.isSafeInteger(value)) {
    throw new Error("TimeDeltaSeconds must be a safe integer.");
  }
  return createTimeDeltaSeconds(value);
}

/**
 * Calculates time left until expiry (signed).
 */
export function calculateTimeLeftSec(
  expiresAt: UnixSeconds,
  nowSec: UnixSeconds,
): TimeDeltaSeconds {
  return toTimeDeltaSeconds(expiresAt - nowSec);
}

/**
 * Calculates age since a timestamp (non-negative).
 *
 * @throws Error if nowSec < issuedAt (clock skew / inconsistent inputs).
 */
export function calculateAgeSec(
  issuedAt: UnixSeconds,
  nowSec: UnixSeconds,
): DurationSeconds {
  return toDurationSeconds(nowSec - issuedAt);
}
