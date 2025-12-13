import type { UserRole } from "@/modules/auth/domain/user/auth.roles";
import type { UserId } from "@/shared/branding/brands";

/**
 * Result returned when verifying a user session.
 */
export interface SessionVerificationResult {
  isAuthorized: true;
  role: UserRole;
  userId: string;
}

export type AuthEncryptPayload = FlatEncryptPayload<UserRole>;

export type FlatEncryptPayload<R = string> = {
  exp?: number;
  expiresAt: number;
  iat?: number;
  role: R;
  sessionStart: number;
  userId: string;
};

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
 * - errors like crypto/cookie failures are represented as `Err(AppError)` at the service boundary
 */
export type UpdateSessionOutcome =
  | UpdateSessionNotRotated
  | UpdateSessionSuccess;
