import "server-only";

import type { UserId } from "@/shared/branding/brands";
import {
  MILLISECONDS_PER_SECOND,
  nowInSeconds,
} from "@/shared/constants/time.constants";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Represents the core session data as a domain entity.
 * This is the central source of truth for an authenticated session's state.
 *
 * All timestamps are in UNIX seconds for consistency with JWT standards.
 *
 * todo: this is so similar to SessionJwtClaims and SessionTokenClaims that maybe i should find a better strategy
 * for layering and clean architecture boundaries
 */
export type SessionEntity = Readonly<{
  /** Expiration time (UNIX timestamp in seconds) */
  expiresAt: number;
  /** Issued at time (UNIX timestamp in seconds) */
  issuedAt: number;
  /** User role */
  role: UserRole;
  /** Session absolute start time (UNIX timestamp in seconds) */
  sessionStart: number;
  /** User identifier (branded) */
  userId: UserId;
}>;

/**
 * Creates a Session entity with validation.
 *
 * Validates:
 * - expiresAt must be greater than issuedAt
 * - sessionStart must be less than or equal to issuedAt
 * - expiresAt must be in the future (relative to current time)
 *
 * @throws Error if validation fails (fail-fast principle)
 */
export function buildSessionEntity(input: SessionEntity): SessionEntity {
  const nowSec = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);

  if (input.expiresAt <= input.issuedAt) {
    throw new Error(
      `Invalid session: expiresAt (${input.expiresAt}) must be greater than issuedAt (${input.issuedAt})`,
    );
  }

  if (input.sessionStart > input.issuedAt) {
    throw new Error(
      `Invalid session: sessionStart (${input.sessionStart}) must be less than or equal to issuedAt (${input.issuedAt})`,
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
    sessionStart: input.sessionStart,
    userId: input.userId,
  };
}

/**
 * Domain Logic: Calculates the remaining time in seconds.
 */
export function getSessionTimeLeftSec(
  session: SessionEntity,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
): number {
  return session.expiresAt - nowSec;
}

/**
 * Domain Logic: Checks if session has expired.
 */
export function isSessionExpired(
  session: SessionEntity,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
): boolean {
  return getSessionTimeLeftSec(session, nowSec) <= 0;
}

/**
 * Domain Logic: Checks if session is approaching expiry within threshold.
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
 */
export function isSessionAbsoluteLifetimeExceeded(
  session: SessionEntity,
  maxLifetimeSec: number,
  nowSec: number = nowInSeconds(),
): { ageSec: number; exceeded: boolean } {
  const ageSec = nowSec - session.sessionStart;
  return { ageSec, exceeded: ageSec > maxLifetimeSec };
}
