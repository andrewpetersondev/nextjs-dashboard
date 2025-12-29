import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Session timing constants.
 *
 * All timing values centralized for audit and tuning.
 */
export const SESSION_COOKIE_NAME = "session" as const;
export const SESSION_DURATION_MS = 900_000 as const; // 15 minutes
export const SESSION_REFRESH_THRESHOLD_MS = 120_000 as const; // 2 minutes
export const MAX_ABSOLUTE_SESSION_MS = 2_592_000_000 as const; // 30 days
export const ONE_SECOND_MS = 1000 as const;

/**
 * JWT configuration constants.
 *
 * Used by SessionJwtAdapter for encoding/decoding session tokens.
 */
export const JWT_ALG_HS256 = "HS256" as const;
export const JWT_TYP_JWT = "JWT" as const;
export const MIN_HS256_KEY_LENGTH = 32 as const;
export const CLOCK_TOLERANCE_SEC = 5 as const;

/**
 * Session policy outcome types.
 *
 * Policy boundary: these represent expected decisions/outcomes, not errors.
 */
export type UpdateSessionFailureReason =
  | "absolute_lifetime_exceeded"
  | "invalid_or_missing_user"
  | "no_cookie"
  | "not_needed";

export type UpdateSessionNotRotated = {
  readonly ageMs?: number;
  readonly maxMs?: number;
  readonly reason: UpdateSessionFailureReason;
  readonly refreshed: false;
  readonly timeLeftMs?: number;
};

export type UpdateSessionSuccess = {
  readonly expiresAt: number;
  readonly reason: "rotated";
  readonly refreshed: true;
  readonly role: UserRole;
  readonly userId: UserId;
};

/**
 * Policy/outcome union for session refresh.
 *
 * - `refreshed: false` cases are expected outcomes (no cookie, not needed, policy exceeded, invalid user)
 * - operational failures are represented as `Err(AppError)` at the service boundary
 */
export type UpdateSessionOutcome =
  | UpdateSessionNotRotated
  | UpdateSessionSuccess;

/** Compute absolute lifetime status from immutable sessionStart. */
export function absoluteLifetime(user?: {
  sessionStart?: number;
  userId?: string;
}): {
  age: number;
  exceeded: boolean;
} {
  const start = user?.sessionStart ?? 0;
  const age = Date.now() - start;
  return { age, exceeded: !start || age > MAX_ABSOLUTE_SESSION_MS };
}

/**
 * Milliseconds remaining until token expiry (negative if expired).
 *
 * Prefers `expiresAt` (ms) when present; falls back to `exp` (seconds).
 */
export function timeLeftMs(payload?: {
  exp?: number;
  expiresAt?: number;
}): number {
  if (payload?.expiresAt && Number.isFinite(payload.expiresAt)) {
    return payload.expiresAt - Date.now();
  }
  const expMs = (payload?.exp ?? 0) * ONE_SECOND_MS;
  return expMs - Date.now();
}

export function shouldRefreshToken(decoded: {
  exp?: number;
  expiresAt?: number;
}): {
  refresh: boolean;
  timeLeftMs: number;
} {
  const remaining = timeLeftMs({
    exp: decoded.exp,
    expiresAt: decoded.expiresAt,
  });
  return {
    refresh: remaining <= SESSION_REFRESH_THRESHOLD_MS,
    timeLeftMs: remaining,
  };
}
