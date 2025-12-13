import type { UserRole } from "@/modules/auth/domain/schema/auth.roles";
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
  | "not_needed"
  | "token_issue_failed"
  | "unexpected_error";

export type UpdateSessionFailure = {
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
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 * Use discriminated union on `refreshed` to safely access user properties.
 */
export type UpdateSessionResult = UpdateSessionSuccess | UpdateSessionFailure;
