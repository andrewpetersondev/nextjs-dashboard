import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type { UserId } from "@/shared/branding/brands";

/**
 * Result returned when verifying a user session.
 */
export interface SessionVerificationResult {
  isAuthorized: true;
  userId: string;
  role: UserRole;
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

/**
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 * Use discriminated union on `refreshed` to safely access user properties.
 */
export type UpdateSessionResult =
  | {
      readonly refreshed: true;
      readonly reason: "rotated";
      readonly expiresAt: number;
      readonly role: UserRole;
      readonly userId: UserId;
    }
  | {
      readonly refreshed: false;
      readonly reason:
        | "absolute_lifetime_exceeded"
        | "invalid_or_missing_user"
        | "no_cookie"
        | "not_needed"
        | "unexpected_error";
      readonly ageMs?: number;
      readonly maxMs?: number;
      readonly timeLeftMs?: number;
    };
