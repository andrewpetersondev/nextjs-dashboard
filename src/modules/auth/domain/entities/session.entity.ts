import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Represents the core session data as a value object.
 * Immutable representation of an authenticated session.
 */
export type Session = Readonly<{
  expiresAt: number;
  role: UserRole;
  sessionStart: number;
  userId: UserId;
}>;

/**
 * Creates a Session value object from decoded JWT claims.
 */
export function createSession(input: {
  expiresAt: number;
  role: UserRole;
  sessionStart: number;
  userId: UserId;
}): Session {
  return {
    expiresAt: input.expiresAt,
    role: input.role,
    sessionStart: input.sessionStart,
    userId: input.userId,
  };
}

/**
 * Checks if session has expired based on current time.
 */
export function isSessionExpired(
  session: Session,
  now: number = Date.now(),
): boolean {
  return session.expiresAt <= now;
}
