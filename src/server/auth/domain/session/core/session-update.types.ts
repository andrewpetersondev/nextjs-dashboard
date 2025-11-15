import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { UserId } from "@/shared/branding/domain-brands";

/**
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 */
export type UpdateSessionResult =
  | { readonly refreshed: false; readonly reason: "no_cookie" }
  | { readonly refreshed: false; readonly reason: "invalid_or_missing_user" }
  | {
      readonly refreshed: false;
      readonly reason: "absolute_lifetime_exceeded";
      readonly ageMs: number;
      readonly maxMs: number;
      readonly userId?: UserId;
    }
  | {
      readonly refreshed: false;
      readonly reason: "not_needed";
      readonly timeLeftMs: number;
    }
  | {
      readonly refreshed: true;
      readonly reason: "rotated";
      readonly expiresAt: number;
      readonly userId: UserId;
      readonly role: UserRole;
    };
