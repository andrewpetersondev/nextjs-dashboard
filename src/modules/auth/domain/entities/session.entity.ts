import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

// todo: SessionEntity vs SessionClaimsSchema vs SessionTokenClaims vs SessionPrincipalDto need further review. one
//  area of concern is the use of branded types vs plain types (e.g., UserId vs string). another area of concern is
//  `exp` vs `expiresAt` redundancy and naming consistency

/**
 * Represents the core session data as a domain entity.
 * This is the central source of truth for an authenticated session's state.
 */
export type SessionEntity = Readonly<{
  expiresAt: number;
  issuedAt: number;
  role: UserRole;
  sessionStart: number;
  userId: UserId;
}>;

/**
 * Creates a Session entity.
 */
export function buildSessionEntity(input: SessionEntity): SessionEntity {
  return {
    expiresAt: input.expiresAt,
    issuedAt: input.issuedAt,
    role: input.role,
    sessionStart: input.sessionStart,
    userId: input.userId,
  };
}

/**
 * Domain Logic: Calculates the remaining time in milliseconds.
 */
export function getSessionTimeLeftMs(
  session: SessionEntity,
  now: number = Date.now(),
): number {
  return session.expiresAt - now;
}

export function isSessionExpired(
  session: SessionEntity,
  now: number = Date.now(),
): boolean {
  return getSessionTimeLeftMs(session, now) <= 0;
}

export function isSessionApproachingExpiry(
  session: SessionEntity,
  thresholdMs: number,
  now: number = Date.now(),
): boolean {
  const remaining = getSessionTimeLeftMs(session, now);
  return remaining > 0 && remaining <= thresholdMs;
}

/**
 * Domain Logic: Checks if the session has exceeded its absolute maximum lifetime.
 */
export function isSessionAbsoluteLifetimeExceeded(
  session: SessionEntity,
  maxLifetimeMs: number,
  now: number = Date.now(),
): { ageMs: number; exceeded: boolean } {
  const ageMs = now - session.sessionStart;
  return { ageMs, exceeded: ageMs > maxLifetimeMs };
}
