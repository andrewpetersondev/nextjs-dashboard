import "server-only";

import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

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
export function makeSession(input: {
  expiresAt: number;
  issuedAt: number;
  role: UserRole;
  sessionStart: number;
  userId: UserId;
}): SessionEntity {
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

/**
 * Domain Logic: Checks if the session has exceeded its absolute maximum lifetime.
 */
export function isSessionAbsoluteLifetimeExceeded(
  session: SessionEntity,
  maxLifetimeMs: number,
  now: number = Date.now(),
): { age: number; exceeded: boolean } {
  const age = now - session.sessionStart;
  return { age, exceeded: age > maxLifetimeMs };
}
