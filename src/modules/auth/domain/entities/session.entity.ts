import type { UserId } from "@/shared/branding/brands";
import {
  MILLISECONDS_PER_SECOND,
  nowInSeconds,
} from "@/shared/constants/time.constants";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Represents the core session data as a domain entity.
 * This is the central source of truth for an authenticated session's state.
 *
 * All timestamps are in UNIX seconds for consistency with JWT standards.
 */
export type SessionEntity = Readonly<{
  /** Expiration time (UNIX timestamp in seconds, matches JWT 'exp' claim) */
  expiresAt: number;
  /** Issued at time (UNIX timestamp in seconds, matches JWT 'iat' claim) */
  issuedAt: number;
  /** User role for authorization checks within the session */
  role: UserRole;
  /** Unique user identifier (branded UserId) */
  userId: UserId;
}>;

/**
 * Creates a Session entity with validation.
 *
 * Validates:
 * - expiresAt must be greater than issuedAt
 * - expiresAt must be in the future (relative to current time)
 *
 * @param input - The session data to validate and build.
 * @returns A validated `SessionEntity`.
 * @throws Error if validation fails (fail-fast principle).
 */
export function buildSessionEntity(input: SessionEntity): SessionEntity {
  const nowSec = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);

  if (input.expiresAt <= input.issuedAt) {
    throw new Error(
      `Invalid session: expiresAt (${input.expiresAt}) must be greater than issuedAt (${input.issuedAt})`,
    );
  }

  if (input.expiresAt <= nowSec) {
    throw new Error(
      `Invalid session: expiresAt (${input.expiresAt}) must be in the future (now: ${nowSec})`,
    );
  }

  return {
    expiresAt: input.expiresAt,
    issuedAt: input.issuedAt,
    role: input.role,
    userId: input.userId,
  };
}

/**
 * Domain Logic: Calculates the remaining time in seconds.
 *
 * @param session - The session entity.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns Number of seconds until session expiry.
 */
export function getSessionTimeLeftSec(
  session: SessionEntity,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
): number {
  return session.expiresAt - nowSec;
}

/**
 * Domain Logic: Checks if session has expired.
 *
 * @param session - The session entity.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns True if the session is expired.
 */
export function isSessionExpired(
  session: SessionEntity,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
): boolean {
  return getSessionTimeLeftSec(session, nowSec) <= 0;
}

/**
 * Domain Logic: Checks if session is approaching expiry within threshold.
 *
 * @param session - The session entity.
 * @param thresholdSec - The threshold in seconds.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns True if the session is within the expiry threshold.
 */
export function isSessionApproachingExpiry(
  session: SessionEntity,
  thresholdSec: number,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
): boolean {
  const remaining = getSessionTimeLeftSec(session, nowSec);
  return remaining > 0 && remaining <= thresholdSec;
}

/**
 * Domain Logic: Checks if the session has exceeded its absolute maximum lifetime.
 * Uses issuedAt as the session start time.
 *
 * @param session - The session entity.
 * @param maxLifetimeSec - Maximum allowed lifetime in seconds.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns Object containing the session age and whether it exceeded the limit.
 */
export function isSessionAbsoluteLifetimeExceeded(
  session: SessionEntity,
  maxLifetimeSec: number,
  nowSec: number = nowInSeconds(),
): { ageSec: number; exceeded: boolean } {
  const ageSec = nowSec - session.issuedAt;
  return { ageSec, exceeded: ageSec > maxLifetimeSec };
}
